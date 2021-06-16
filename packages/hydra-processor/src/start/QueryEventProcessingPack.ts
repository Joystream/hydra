// @ts-check
import { DatabaseManager, SubstrateEvent } from '@joystream/hydra-common'

export type QueryEventProcessorResult = void | Promise<void>
export type EventHandlerFunc = (
  db: DatabaseManager,
  event: SubstrateEvent
) => QueryEventProcessorResult

export interface QueryEventProcessingPack {
  [index: string]: EventHandlerFunc
}

export type HandlerFunc = (...args: unknown[]) => void | Promise<void>
