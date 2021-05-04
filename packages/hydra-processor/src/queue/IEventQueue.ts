import { SubstrateEvent } from '@dzlzv/hydra-common'
import { BlockRange } from '../start/manifest'

export enum MappingType {
  EXTRINSIC = 'EXTRINSIC',
  EVENT = 'EVENT',
  BLOCK = 'BLOCK',
}

export interface MappingContext {
  // TODO: update interfaces in hydra-common
  event: SubstrateEvent
  type: MappingType
}

export interface BlockContext {
  blockNumber: number
  eventCtxs: MappingContext[]
}

export interface IEventQueue {
  isEmpty(): boolean
  blocks(): AsyncGenerator<BlockContext, void, void>
  start(): Promise<void>
  stop(): void
}

/**
 * Describes a block range and id_gt filters for fetching events within a certain range
 */
export interface RangeFilter {
  id: {
    gt: string //  events after this event ID
  }
  block: {
    // events in the block range (gt, lte]
    gt: number
    lte: number
  }
  limit: number // fetch at most that many events
}

// export interface FilterConfig extends RangeFilter {
//   events: string[]
//   extrinsics: {
//     names: string[]
//     triggerEvents: string[]
//   }
//   blocks: number[]
// }

/**
 * Describes a set of query filters derived from the
 * mapping definition
 */
export interface MappingFilter {
  range: BlockRange
  events: string[]
  extrinsics: {
    names: string[]
    triggerEvents: string[]
  }
  blockHooks: BlockRange[]
}
