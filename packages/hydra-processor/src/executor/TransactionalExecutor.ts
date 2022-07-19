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
import { generateNextId } from './EntityIdGenerator'

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
      const fixedOptions = {
        ...options,
        where: options.where || {},
      } // required by typeorm '0.3.5'
      return (await entityManager.findOne(entity, fixedOptions)) || undefined
    },
    getMany: async <T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity: { new (...args: any[]): T },
      options: FindOneOptions<T>
    ): Promise<T[]> => {
      const fixedOptions = {
        ...options,
        where: options.where || {},
      } // required by typeorm '0.3.5'
      return await entityManager.find(entity, fixedOptions)
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
    const entityClass = (
      entity as unknown as {
        constructor: ObjectType<{ id: string }>
      }
    ).constructor

    Object.assign(entity, {
      id: await generateNextId(entityManager, entityClass),
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
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('createdAt') || entity.createdAt === undefined) {
    Object.assign(entity, {
      createdAt: new Date(block.timestamp),
    })
  }

  Object.assign(entity, {
    updatedAt: new Date(block.timestamp),
  })

  return entity
}
