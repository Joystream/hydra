import { SubstrateBlock, SubstrateEvent } from '@subsquid/hydra-common'
import { Range } from '../util'

export enum Kind {
  EXTRINSIC = 'EXTRINSIC',
  EVENT = 'EVENT',
  BLOCK = 'BLOCK',
}

export interface EventData {
  event: SubstrateEvent
  kind: Kind
}

export interface BlockData {
  block: SubstrateBlock

  events: EventData[]
}

export interface IBlockQueue {
  isEmpty(): boolean
  blocksWithEvents(): AsyncGenerator<BlockData, void, void>
  blocksWithHooks(range: Range): AsyncGenerator<BlockData, void, void>
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

/**
 * Describes a set of query filters derived from the
 * mapping definition
 */
export interface MappingFilter {
  range: Range
  events: string[]
  extrinsics: {
    names: string[]
    triggerEvents: string[]
  }
}
