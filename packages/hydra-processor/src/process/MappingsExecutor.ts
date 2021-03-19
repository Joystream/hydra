import { SubstrateEvent } from '@dzlzv/hydra-common'
import { MappingsLookupService } from './MappingsLookupService'
import { getConnection, EntityManager } from 'typeorm'
import { makeDatabaseManager } from '@dzlzv/hydra-db-utils'
import { conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'
import { EventContext } from '../queue'

const debug = Debug('hydra-processor:mappings-executor')

export class MappingsExecutor {
  constructor(protected mappingsLookup = new MappingsLookupService()) {}

  async init(): Promise<void> {
    info('Initializing mappings executor')
    await this.mappingsLookup.load()
  }

  async executeMappings(
    execCtxs: EventContext[],
    onMappingSuccess: (ctx: {
      event: SubstrateEvent
      em: EntityManager
    }) => Promise<void>
  ) {
    await getConnection().transaction(async (manager: EntityManager) => {
      for (const ctx of execCtxs) {
        const { event } = ctx
        debug(`Processing event ${event.id}`)

        if (conf.VERBOSE) debug(`JSON: ${JSON.stringify(event, null, 2)}`)

        await this.mappingsLookup.lookupAndCall({
          // TODO: pass the execution context
          dbStore: makeDatabaseManager(manager),
          context: event,
        })

        await onMappingSuccess({
          event,
          em: manager,
        })

        debug(`Event ${event.id} done`)
      }
    })
  }
}
