import { SubstrateBlock, SubstrateEvent } from '@joystream/hydra-common'
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

/**
 * An interface incapsulting the raw block + event data
 */
export interface BlockData {
  block: SubstrateBlock

  events: EventData[]
}

/**
 * A data buffer that stores unprocessed data. The idea is that we fill this buffer asyncronously
 * so that the pulls from `MappingProcessor` never wait
 */
export interface IBlockQueue {
  /**
   * If the queue is currently empty
   */
  isEmpty(): boolean

  /**
   *  An async stream of `BlockData` containing an ordered stream of blocks.
   *  The blocks always contain at least one event that has a mapping for it
   */
  blocksWithEvents(): AsyncGenerator<BlockData, void, void>

  /**
   *
   * An async stream of blocks for which there are registered hooks in the manifest.
   * The reason for having a separate stream for such blocks is that `blockWithEvents` only
   * yield blocks with at least a single event with mapping. Here we accomodate block which does not
   * contain mappable events, but nevertheless we have hooks for them (e.g. based on the height range)
   *
   * @param range - a range filter
   */
  blocksWithHooks(range: Range): AsyncGenerator<BlockData, void, void>

  /**
   * Start filling up the queue
   */
  start(): Promise<void>

  /**
   * Stop filling up the queue
   */
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
