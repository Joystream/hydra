import Debug from 'debug'
import { getManifest } from '../start/config'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'

const debug = Debug('index-builder:processor')

export class HandlerLookupService {
  private events: string[]

  constructor(protected mappings = getManifest().mappings) {
    this.events = Object.keys(this.mappings.eventHandlers)

    debug(
      `The following events will be processed: ${JSON.stringify(
        this.events,
        null,
        2
      )}`
    )

    debug(
      `The following extrinsics will be processed: ${JSON.stringify(
        Object.keys(this.mappings.extrinsicHandlers),
        null,
        2
      )}`
    )
  }

  eventsToHandle(): string[] {
    return this.events
  }

  async lookupAndCall({ dbStore, context }: CallArgs): Promise<void> {
    if (!(context.name in this.mappings.extrinsicHandlers)) {
      throw new Error(`No mapping is defined for ${context.name}`)
    }

    const { handlerFunc, argTypes } = this.mappings.eventHandlers[context.name]

    await handlerFunc(dbStore, context)
  }
}

export interface CallArgs {
  dbStore: DatabaseManager
  context: SubstrateEvent
}
