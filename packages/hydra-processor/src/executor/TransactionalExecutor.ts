import { getConnection, EntityManager } from 'typeorm'
import * as shortid from 'shortid'
import { getConfig as conf } from '../start/config'
import Debug from 'debug'
import { stringify, info } from '../util'
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
      const { pre, post } = this.mappingsLookup.lookupBlockHandlers(blockData)
      if (conf().VERBOSE)
        debug(
          `Mappings for block ${blockData.block.id}: ${stringify({
            pre,
            post,
          })}`
        )

      const store = getStore(entityManager, blockData)

      for (const hook of pre) {
        await this.mappingsLookup.call(hook, {
          ...blockData,
          store,
        })
      }

      for (let i = 0; i < blockData.events.length; i++) {
        const eventData = blockData.events[i]
        const handler = this.mappingsLookup.lookupEventHandler(
          eventData,
          blockData
        )
        if (handler == null) continue

        const event = eventData.event
        debug(`Processing event ${event.id}`)
        if (conf().VERBOSE) debug(`JSON: ${stringify(event)}`)

        await this.mappingsLookup.call(handler, {
          ...blockData,
          event,
          store,
          extrinsic: event.extrinsic,
        })

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
