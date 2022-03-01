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

class EntityIdGenerator {
  private entityClass: ObjectType<{ id: string }>
  private nextEntityIdPromise: Promise<string> | undefined
  private lastKnownEntityId: string | undefined
  // each id is 6 chars out of 62-size alphabet, giving us 56800235584 possible ids (per entity type)
  public static alphabet =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  public static idSize = 6

  constructor(entityClass: ObjectType<{ id: string }>) {
    this.entityClass = entityClass
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
    const { alphabet, idSize } = EntityIdGenerator
    if (!lastKnownId) {
      this.lastKnownEntityId = Array.from(
        { length: idSize },
        () => alphabet[0]
      ).join('')
      return this.lastKnownEntityId
    }

    let targetIdIndexToChange = idSize - 1
    while (
      targetIdIndexToChange >= 0 &&
      lastKnownId[targetIdIndexToChange] === alphabet[alphabet.length - 1]
    ) {
      --targetIdIndexToChange
    }

    if (targetIdIndexToChange < 0) {
      throw new Error('EntityIdGenerator: Ran out of possible ids!')
    }

    const nextEntityIdChars = [...lastKnownId]
    const nextAlphabetCharIndex =
      alphabet.indexOf(lastKnownId[targetIdIndexToChange]) + 1
    nextEntityIdChars[targetIdIndexToChange] = alphabet[nextAlphabetCharIndex]
    for (let i = idSize - 1; i > targetIdIndexToChange; --i) {
      nextEntityIdChars[i] = alphabet[0]
    }

    this.lastKnownEntityId = nextEntityIdChars.join('')
    return this.lastKnownEntityId
  }

  public async getNextEntityId(em: EntityManager): Promise<string> {
    // Make sure the ids are generated sequentially!
    if (this.nextEntityIdPromise) {
      await this.nextEntityIdPromise
    }
    this.nextEntityIdPromise = this.generateNextEntityId(em)
    return this.nextEntityIdPromise
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
      entity = await fillRequiredWarthogFields(entity, entityManager, blockData)
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
      return await entityManager.findOne(entity, options)
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
async function fillRequiredWarthogFields<T>(
  entity: DeepPartial<T>,
  entityManager: EntityManager,
  { block }: BlockData
): Promise<DeepPartial<T>> {
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
