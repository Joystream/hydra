import { getConnection, EntityManager } from 'typeorm'
import * as shortid from 'shortid'
import { getConfig as conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'
import { BlockData } from '../queue'
import { getMappingsLookup, IMappingExecutor } from '.'
import { IMappingsLookup } from './IMappingsLookup'
import { DeepPartial, DatabaseManager } from '@subsquid/hydra-common'
import { makeDatabaseManager } from '../db'
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

      const store = getStore(entityManager, blockData)

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
export function getStore(
  entityManager: EntityManager,
  blockData: BlockData
): DatabaseManager {
  const store = makeDatabaseManager(entityManager)

  return {
    ...store,
    save: async <T>(entity: DeepPartial<T>): Promise<void> => {
      entity = fillRequiredWarthogFields(entity, blockData)
      await store.save(entity)
    },
  }
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
function fillRequiredWarthogFields<T>(
  entity: DeepPartial<T>,
  { block }: BlockData
): DeepPartial<T> {
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
