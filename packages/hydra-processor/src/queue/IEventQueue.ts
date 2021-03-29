import { SubstrateEvent } from '@dzlzv/hydra-common'

export enum MappingType {
  EXTRINSIC = 'EXTRINSIC',
  EVENT = 'EVENT',
  BLOCK_PRE_HOOK = 'BLOCK_PRE_HOOK',
  BLOCK_POST_HOOK = 'BLOCK_POST_HOOK',
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
  extrinsics: string[]
  limit: number
}

export interface MappingFilter {
  blockInterval: { from: number; to: number }
  events: string[]
  extrinsics: string[]
  hasPreHooks: boolean
  hasPostHooks: boolean
}
