/* eslint-disable @typescript-eslint/naming-convention */
import { SubstrateBlock, SubstrateEvent } from '@subsquid/hydra-common'
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
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type QueryField<T> =
  | keyof T
  | Partial<
      {
        [P in keyof T]: QueryFields<
          T[P] extends readonly unknown[] ? ArrayElement<T[P]> : T[P]
        >
      }
    >

export type QueryFields<T> = Array<QueryField<T>>
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

export interface GraphQLQuery<T> {
  name: string
  query: QueryFilter<T>
  fields: QueryFields<T>
}

export interface IProcessorSource {
  nextBatch<T>(
    queries: {
      [K in keyof T]: IndexerQuery
    }
  ): Promise<{ [K in keyof typeof queries]: SubstrateEvent[] }>

  // Commenting out for now, as it is not essential
  // executeQueries<T>(
  //   queries: {
  //     [K in keyof T]: GraphQLQuery<T[K]>
  //   }
  // ): Promise<{ [K in keyof T]: (T[K] & AsJson<T[K]>)[] }>

  getIndexerStatus(): Promise<IndexerStatus>

  subscribe(events: string[]): Promise<void>

  getBlock(blockNumber: number): Promise<SubstrateBlock>

  fetchBlocks(heights: number[]): Promise<SubstrateBlock[]>
}
