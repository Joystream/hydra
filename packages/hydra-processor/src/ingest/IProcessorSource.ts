/* eslint-disable @typescript-eslint/naming-convention */
import {
  AnyJson,
  SubstrateBlock,
  SubstrateEvent,
} from '@joystream/hydra-common'
import { IndexerStatus } from '../state'

export interface Filter {
  in: string[] | number[]
  gte: number | string
  lte: number | string
  gt: number | string
  lt: number | string
  startsWith: string
  contains: string
  endsWith: string
}

export type TypedFilter<T> = T extends string | number
  ? PrimitiveFilter<T>
  : T extends unknown[]
  ? ArrayFilter<T> // eslint-disable-next-line @typescript-eslint/ban-types
  : T extends object
  ? ObjectFilter<T>
  : never

export type PrimitiveFilter<T> = T extends number
  ? CommonFilter<T>
  : T extends string
  ? CommonFilter<T> | StringFilter
  : never

export interface CommonFilter<T extends string | number> {
  gte: T
  lte: T
  gt: T
  lt: T
  in: T[]
}

export interface StringFilter {
  startsWith: string
  contains: string
  endsWith: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ArrayFilterValue<T> = T extends object[]
  ? ObjectFilter<ArrayElement<T>>
  : T extends string[] | number[]
  ? PrimitiveFilter<ArrayElement<T>>
  : never

export interface ArrayFilter<T extends readonly unknown[]> {
  some: ArrayFilterValue<T>
  each: ArrayFilterValue<T>
  none: ArrayFilterValue<T>
}

export type ObjectFilter<T> = Partial<
  {
    [P in keyof T]: Partial<TypedFilter<T[P]>>
  }
>

export interface QueryFilter<T> {
  where: ObjectFilter<T>
  limit?: number
  orderBy?: Partial<{
    asc: string
    desc: string
  }>
}

// extract T from type of Array<T>
export type ArrayElement<
  ArrayType extends readonly unknown[]
> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type QueryField<T> =
  | keyof T
  | Partial<
      {
        [P in keyof T]: QueryFields<
          T[P] extends readonly unknown[] ? ArrayElement<T[P]> : T[P]
        >
      }
    >

export type AsJson<T> = T extends
  | string
  | number
  | BigInt
  | AnyJson
  | boolean
  | null
  ? T // eslint-disable-next-line @typescript-eslint/ban-types
  : T extends Function
  ? never // eslint-disable-next-line @typescript-eslint/ban-types
  : T extends object
  ? { [K in keyof T]: AsJson<T[K]> }
  : never

export type QueryFields<T> = Array<QueryField<T>>

/**
 * Query interface for fetching events from the indexer
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

/**
 * An typed interface for a generic indexer query
 */
export interface GraphQLQuery<T> {
  /**
   * query name as described by the schema of the indexer-gateway
   */
  name: string

  /**
   *  query filters, limit and ordering info
   */
  query: QueryFilter<T>

  /**
   * query fields to fetch (including nested field)
   */
  fields: QueryFields<T>
}

/**
 * A service incapsulating communication with the indexer-gateway
 */
export interface IProcessorSource {
  /**
   * Run miltiple indexer queries in a single request.
   * Should be deprecated in favour of a more general `executeQueries` method
   *
   * @param queries - a set of queries to run
   */
  nextBatch<T>(
    queries: {
      [K in keyof T]: IndexerQuery
    }
  ): Promise<{ [K in keyof typeof queries]: SubstrateEvent[] }>

  /**
   * Run multiple generic indexer queries in a single request
   *
   * @param queries -  a set of queries to run
   */
  executeQueries<T>(
    queries: {
      [K in keyof T]: GraphQLQuery<T[K]>
    }
  ): Promise<{ [K in keyof T]: (T[K] & AsJson<T[K]>)[] }>

  /**
   * Get the current indexer state by running a `status` query
   */
  getIndexerStatus(): Promise<IndexerStatus>

  /**
   * TODO: this is not implemented yet, and currently the processor is poll-only.
   * In the future, the processor should rely both on polling and subscriptions to reduce
   * the latency between the indexer and the processor
   *
   * @param events - a list of events the processor is listening
   */
  subscribe(events: string[]): Promise<void>

  /**
   * Fetch block data for a given block
   *
   * @param blockNumber - block height to get the data
   */
  getBlock(blockNumber: number): Promise<SubstrateBlock>

  /**
   * Fetch block data for multiple heights in a single batch
   *
   * @param heights - an array of block heights
   */
  fetchBlocks(heights: number[]): Promise<SubstrateBlock[]>
}
