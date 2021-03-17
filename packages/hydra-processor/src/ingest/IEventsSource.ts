/* eslint-disable @typescript-eslint/naming-convention */
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { IndexerStatus } from '../state'

export interface Filter {
  in: string[]
  gte: number | string
  lte: number | string
  gt: number | string
  lt: number | string
}

/**
 * Query for fetching events
 *  - strictly after event with IDs > afterID (if present)
 *  - with name in names
 *  - block between fromBlock and toBlock (inclusive)
 */
export interface IndexerQuery {
  id: Partial<Filter>
  event: Partial<Filter>
  extrinsic?: Partial<Filter>
  block: Partial<Filter>
  limit?: number
}

export interface IEventsSource {
  nextBatch<T>(
    queries: {
      [K in keyof T]: IndexerQuery
    }
  ): Promise<{ [K in keyof typeof queries]: SubstrateEvent[] }>

  indexerStatus(): Promise<IndexerStatus>

  subscribe(events: string[]): Promise<void>
}
