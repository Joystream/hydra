import { MappingsLookupService } from './MappingsLookupService'
import { getConnection, EntityManager } from 'typeorm'
import { makeDatabaseManager } from '@dzlzv/hydra-db-utils'
import { conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'
import { EventContext } from '../queue'
import { IMappingExecutor } from '.'

const debug = Debug('hydra-processor:mappings-executor')

/**
 * A transactional event context
 */
export interface TxAwareEventContext extends EventContext {
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
export function isTxAware(ctx: EventContext): ctx is TxAwareEventContext {
  return (ctx as any).entityManager !== undefined
}

export class TransactionalExecutor implements IMappingExecutor {
  constructor(protected mappingsLookup = new MappingsLookupService()) {}

  async init(): Promise<void> {
    info('Initializing mappings executor')
    await this.mappingsLookup.load()
  }

  async executeBatch(
    eventCtx: EventContext[],
    onMappingSuccess: (ctx: EventContext) => Promise<void>
  ): Promise<void> {
    await getConnection().transaction(async (entityManager: EntityManager) => {
      for (const ctx of eventCtx) {
        const { event } = ctx
        debug(`Processing event ${event.id}`)

        if (conf.VERBOSE) debug(`JSON: ${JSON.stringify(event, null, 2)}`)

        await this.mappingsLookup.lookupAndCall({
          // TODO: pass the execution context
          // dbStore: makeDatabaseManager(getConnection().manager),
          dbStore: makeDatabaseManager(entityManager),
          context: event,
        })

        await onMappingSuccess({ event, entityManager } as TxAwareEventContext)

        debug(`Event ${event.id} done`)
      }
    })
  }
}
