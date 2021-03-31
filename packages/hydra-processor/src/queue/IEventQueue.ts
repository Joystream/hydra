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

export interface FilterConfig {
  id: {
    gt: string
  }
  block: {
    gt: number
    lte: number
  }
  events: string[]
  extrinsics: {
    names: string[]
    triggerEvents: string[]
  }
  blocks: number[]
  limit: number
}

export interface MappingFilter {
  range: BlockRange
  events: string[]
  extrinsics: {
    names: string[]
    triggerEvents: string[]
  }
  blockHooks: BlockRange[]
}
