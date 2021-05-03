import { getConnection, EntityManager } from 'typeorm'
import { makeDatabaseManager } from '@dzlzv/hydra-db-utils'
import { getConfig as conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'
import { BlockData, Kind } from '../queue'
import { getMappingsLookup, IMappingExecutor } from '.'
import { IMappingsLookup, EventContext } from './IMappingsLookup'

const debug = Debug('hydra-processor:mappings-executor')

/**
 * A transactional event context
 */
export interface TxAwareBlockContext extends BlockData {
  /**
   * A TypeORM entityManager holding the DB transaction within which the mapping batch is executed
   */
  entityManager: EntityManager
}

/**
 *
 * @param ctx Event
 * @returns If the event context has been enriched with a transactional EntityManager
 */
export function isTxAware(ctx: BlockData): ctx is TxAwareBlockContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx as any).entityManager !== undefined
}

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
        const { event, kind } = blockData.events[i]
        debug(`Processing event ${event.id}`)

        if (conf().VERBOSE) debug(`JSON: ${JSON.stringify(event, null, 2)}`)

        const ctx = {
          ...blockData,
          event,
          store,
          extrinsic: kind == Kind.EXTRINSIC ? event.extrinsic : undefined,
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
