import { getConnection, EntityManager } from 'typeorm'
import { getConfig as conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'
import { BlockData } from '../queue'
import { getMappingsLookup, IMappingExecutor } from '.'
import { IMappingsLookup } from './IMappingsLookup'
import {
  DeepPartial,
  FindOneOptions,
  DatabaseManager,
} from '@joystream/hydra-common'
import { TxAwareBlockContext } from './tx-aware'
import { ObjectType } from 'typedi'
import AsyncLock from 'async-lock'

const debug = Debug('hydra-processor:mappings-executor')

export class TransactionalExecutor implements IMappingExecutor {
  private mappingsLookup!: IMappingsLookup

  // "expose" transaction EntityManager to tests (is meant to be read despite being private)
  private entityManager: EntityManager | null = null

  async init(): Promise<void> {
    info('Initializing mappings executor')
    this.mappingsLookup = await getMappingsLookup()
  }

  async executeBlock(
    blockData: BlockData,
    onSuccess: (data: BlockData) => Promise<void>
  ): Promise<void> {
    await getConnection().transaction(async (entityManager: EntityManager) => {
      this.entityManager = entityManager

      const allMappings = this.mappingsLookup.lookupHandlers(blockData)
      if (conf().VERBOSE)
        debug(
          `Mappings for block ${blockData.block.id}: ${JSON.stringify(
            allMappings,
            null,
            2
          )}`
        )

      const { pre, post, mappings } = allMappings

      const store = makeDatabaseManager(entityManager, blockData)

      for (const hook of pre) {
        await this.mappingsLookup.call(hook, {
          ...blockData,
          store,
        })
      }

      let i = 0
      for (const mapping of mappings) {
        const { event } = blockData.events[i]
        debug(`Processing event ${event.id}`)

        if (conf().VERBOSE) debug(`JSON: ${JSON.stringify(event, null, 2)}`)

        const ctx = {
          ...blockData,
          event,
          store,
          extrinsic: event.extrinsic,
        }

        await this.mappingsLookup.call(mapping, ctx)
        i++

        debug(`Event ${event.id} done`)
      }

      for (const hook of post) {
        await this.mappingsLookup.call(hook, { ...blockData, store })
      }

      await onSuccess({ ...blockData, entityManager } as TxAwareBlockContext)

      this.entityManager = null
    })
  }
}

export class EntityIdGenerator {
  private entityClass: ObjectType<{ id: string }>
  private nextEntityIdPromise: Promise<string> | undefined
  private lastKnownEntityId: string | undefined
  private static lock = new AsyncLock({ maxPending: 10000 })
  // each id is 8 chars out of 36-size alphabet, giving us 2821109907456 possible ids (per entity type)
  public static alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'

  public static idSize = 8

  public static firstEntityId = Array.from(
    { length: EntityIdGenerator.idSize },
    () => EntityIdGenerator.alphabet[0]
  ).join('')

  constructor(entityClass: ObjectType<{ id: string }>) {
    this.entityClass = entityClass
  }

  public static entityIdAfter(id?: string): string {
    if (id === undefined) {
      return EntityIdGenerator.firstEntityId
    }

    const { alphabet, idSize } = EntityIdGenerator
    let targetIdIndexToChange = idSize - 1
    while (
      targetIdIndexToChange >= 0 &&
      id[targetIdIndexToChange] === alphabet[alphabet.length - 1]
    ) {
      --targetIdIndexToChange
    }

    if (targetIdIndexToChange < 0) {
      throw new Error(`EntityIdGenerator: Cannot get entity id after: ${id}!`)
    }

    const nextEntityIdChars = [...id]
    const nextAlphabetCharIndex =
      alphabet.indexOf(id[targetIdIndexToChange]) + 1
    nextEntityIdChars[targetIdIndexToChange] = alphabet[nextAlphabetCharIndex]
    for (let i = idSize - 1; i > targetIdIndexToChange; --i) {
      nextEntityIdChars[i] = alphabet[0]
    }

    return nextEntityIdChars.join('')
  }

  private async queryLastEntityId(
    em: EntityManager
  ): Promise<string | undefined> {
    const lastEntity = await em.findOne(this.entityClass, {
      order: { id: 'DESC' },
    })

    return lastEntity?.id
  }

  private async getLastKnownEntityId(
    em: EntityManager
  ): Promise<string | undefined> {
    if (this.lastKnownEntityId === undefined) {
      this.lastKnownEntityId = await this.queryLastEntityId(em)
    }
    return this.lastKnownEntityId
  }

  private async generateNextEntityId(em: EntityManager): Promise<string> {
    const lastKnownId = await this.getLastKnownEntityId(em)
    const nextEntityId = EntityIdGenerator.entityIdAfter(lastKnownId)
    this.lastKnownEntityId = nextEntityId

    return this.lastKnownEntityId
  }

  public async getNextEntityId(em: EntityManager): Promise<string> {
    return EntityIdGenerator.lock.acquire(this.entityClass.name, () =>
      this.generateNextEntityId(em)
    )
  }
}

const entityIdGenerators = new Map<string, EntityIdGenerator>()

/**
 * Create database manager.
 * @param entityManager EntityManager
 */
export function makeDatabaseManager(
  entityManager: EntityManager,
  blockData: BlockData
): DatabaseManager {
  return {
    save: async <T>(entity: DeepPartial<T>): Promise<void> => {
      // TODO: try to move ` as DeepPartial<T & Record<string, unknown>>` typecast to function definition
      entity = await fillRequiredWarthogFields(
        entity as DeepPartial<T & Record<string, unknown>>,
        entityManager,
        blockData
      )
      await entityManager.save(entity)
    },
    remove: async <T>(entity: DeepPartial<T>): Promise<void> => {
      await entityManager.remove(entity)
    },
    get: async <T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity: { new (...args: any[]): T },
      options: FindOneOptions<T>
    ): Promise<T | undefined> => {
      return (await entityManager.findOne(entity, options)) || undefined
    },
    getMany: async <T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity: { new (...args: any[]): T },
      options: FindOneOptions<T>
    ): Promise<T[]> => {
      return await entityManager.find(entity, options)
    },
  } as DatabaseManager
}

/**
 * Fixes compatibility between typeorm and warthog models.
 *
 * @tutorial Warthog add extra properties to its BaseModel and some of these properties are
 * required. This function mutate the entity to make it compatible with warthog models.
 * Warthog throw error if required properties contains null values.
 *
 * @param entity: DeepPartial<T>
 */
async function fillRequiredWarthogFields<T extends Record<string, unknown>>(
  entity: DeepPartial<T>,
  entityManager: EntityManager,
  { block }: BlockData
): Promise<DeepPartial<T>> {
  // TODO: find a way how to remove this; needed to limit possible `entity` types
  //       to `object` to keep `hasOwnProperty` functional after typeorm upgrade
  if (!(entity as any).hasOwnProperty) {
    throw new Error('Unexpected situation in prefilling Warthog fields')
  }

  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('id')) {
    const entityClass = ((entity as unknown) as {
      constructor: ObjectType<{ id: string }>
    }).constructor

    if (!entityIdGenerators.has(entityClass.name)) {
      entityIdGenerators.set(
        entityClass.name,
        new EntityIdGenerator(entityClass)
      )
    }

    const idGenerator = entityIdGenerators.get(
      entityClass.name
    ) as EntityIdGenerator

    Object.assign(entity, {
      id: await idGenerator.getNextEntityId(entityManager),
    })
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('createdById')) {
    Object.assign(entity, { createdById: '-' })
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('version')) {
    Object.assign(entity, { version: 1 })
  }

  // set createdAt to the block timestamp if not set
  if (
    // eslint-disable-next-line no-prototype-builtins
    !entity.hasOwnProperty('createdAt') ||
    (entity as { createdAt: unknown }).createdAt === undefined
  ) {
    Object.assign(entity, {
      createdAt: new Date(block.timestamp),
    })
  }

  // set updatedAt to the block timestamp if not set
  if (
    // eslint-disable-next-line no-prototype-builtins
    !entity.hasOwnProperty('updatedAt') ||
    (entity as { updatedAt: unknown }).updatedAt === undefined
  ) {
    Object.assign(entity, {
      updatedAt: new Date(block.timestamp),
    })
  }

  return entity
}
