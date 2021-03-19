import { SubstrateEvent } from '@dzlzv/hydra-common'

export enum MappingType {
  EXTRINSIC = 'EXTRINSIC',
  EVENT = 'EVENT',
  BLOCK_PRE_HOOK = 'BLOCK_PRE_HOOK',
  BLOCK_POST_HOOK = 'BLOCK_POST_HOOK',
}

export interface EventContext {
  // TODO: update interfaces in hydra-common
  event: SubstrateEvent
  type: MappingType
}

export interface IEventQueue {
  nextBatch(size?: number): Promise<EventContext[]>
  hasNext(): boolean
  isEmpty(): boolean
  lastScannedBlock(): number
  init(): Promise<void>
  start(): Promise<void>
  stop(): void
}

export interface FilterConfig {
  id: {
    gt: string
  }
  block: {
    gte: number
    lte: number
  }
  events: string[]
  extrinsics: string[]
  limit: number
}
