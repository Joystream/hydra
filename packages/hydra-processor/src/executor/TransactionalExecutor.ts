import { getConnection, EntityManager } from 'typeorm'
import { makeDatabaseManager } from '@dzlzv/hydra-db-utils'
import { conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'
import { BlockContext } from '../queue'
import { getMappingsLookup, IMappingExecutor } from '.'
import {
  BlockHookContext,
  IMappingsLookup,
  EventContext,
} from './IMappingsLookup'

const debug = Debug('hydra-processor:mappings-executor')

/**
 * A transactional event context
 */
export interface TxAwareBlockContext extends BlockContext {
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
export function isTxAware(ctx: BlockContext): ctx is TxAwareBlockContext {
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
    blockCtx: BlockContext,
    onSuccess: (ctx: BlockContext) => Promise<void>
  ): Promise<void> {
    await getConnection().transaction(async (entityManager: EntityManager) => {
      const allMappings = this.mappingsLookup.lookupHandlers(blockCtx)
      if (conf.VERBOSE)
        debug(
          `Mappings for block ${blockCtx.blockNumber}: ${JSON.stringify(
            allMappings,
            null,
            2
          )}`
        )

      const { pre, post, mappings } = allMappings

      const dbStore = makeDatabaseManager(entityManager)

      for (const hook of pre) {
        await this.mappingsLookup.call(hook, {
          ...blockCtx,
          store: dbStore,
        } as BlockHookContext)
      }

      let i = 0
      for (const mapping of mappings) {
        const ctx = blockCtx.eventCtxs[i]
        debug(`Processing event ${ctx.event.id}`)

        if (conf.VERBOSE) debug(`JSON: ${JSON.stringify(ctx, null, 2)}`)

        await this.mappingsLookup.call(mapping, {
          ...ctx,
          store: dbStore,
        } as EventContext)
        i++

        debug(`Event ${ctx.event.id} done`)
      }

      for (const hook of post) {
        await this.mappingsLookup.call(hook, { ...blockCtx, store: dbStore })
      }

      await onSuccess({ ...blockCtx, entityManager } as TxAwareBlockContext)
    })
  }
}
