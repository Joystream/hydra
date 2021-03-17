import { SubstrateEvent } from '@dzlzv/hydra-common'
import { MappingsLookupService } from './MappingsLookupService'
import { getConnection, EntityManager } from 'typeorm'
import { makeDatabaseManager } from '@dzlzv/hydra-db-utils'
import { conf } from '../start/config'
import Debug from 'debug'
import { info } from '../util/log'

const debug = Debug('hydra-processor:mappings-executor')

export class MappingsExecutor {
  constructor(protected mappingsLookup = new MappingsLookupService()) {}

  async init(): Promise<void> {
    info('Initializing mappings executor')
    await this.mappingsLookup.load()
  }

  async executeMappings(
    events: SubstrateEvent[],
    onMappingSuccess: (ctx: {
      event: SubstrateEvent
      em: EntityManager
    }) => Promise<void>
  ) {
    await getConnection().transaction(async (manager: EntityManager) => {
      for (const event of events) {
        debug(`Processing event ${event.id}`)

        if (conf.VERBOSE) debug(`JSON: ${JSON.stringify(event, null, 2)}`)

        await this.mappingsLookup.lookupAndCall({
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
