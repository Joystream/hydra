import { getConnection, EntityManager } from 'typeorm'
import * as shortid from 'shortid'
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

const debug = Debug('hydra-processor:mappings-executor')

export class TransactionalExecutor implements IMappingExecutor {
  private mappingsLookup!: IMappingsLookup

  async init(): Promise<void> {
    info('Initializing mappings executor')
    this.mappingsLookup = await getMappingsLookup()
  }

  async executeBlock(
    blockData: BlockData,
    onSuccess: (data: BlockData) => Promise<void>
  ): Promise<void> {
    await getConnection().transaction(async (entityManager: EntityManager) => {
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

      const store = makeDatabaseManager(entityManager)

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
    })
  }
}

/**
 * Create database manager.
 * @param entityManager EntityManager
 */
export function makeDatabaseManager(
  entityManager: EntityManager
): DatabaseManager {
  return {
    save: async <T>(entity: DeepPartial<T>): Promise<void> => {
      entity = fillRequiredWarthogFields(entity)
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
function fillRequiredWarthogFields<T>(entity: DeepPartial<T>): DeepPartial<T> {
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('id')) {
    Object.assign(entity, { id: shortid.generate() })
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('createdById')) {
    Object.assign(entity, { createdById: shortid.generate() })
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('version')) {
    Object.assign(entity, { version: 1 })
  }
  return entity
}
