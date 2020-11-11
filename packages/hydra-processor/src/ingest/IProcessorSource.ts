import { SubstrateEvent } from '@dzlzv/hydra-common'
import { EventEmitter } from 'events'

/**
 * Filter for fetching events
 *  - strictly after event with IDs > afterID (if present)
 *  - with name in names
 *  - block between fromBlock and toBlock (inclusive)
 */
export interface EventFilter {
  afterID?: string
  names: string[]
  fromBlock: number
  toBlock: number
}

export interface IProcessorSource extends EventEmitter {
  nextBatch(filter: EventFilter, limit: number): Promise<SubstrateEvent[]>

  indexerHead(): Promise<number>

  subscribe(events: string[]): Promise<void>
}
