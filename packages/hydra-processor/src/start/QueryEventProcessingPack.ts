// @ts-check

import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { SubstrateEvent } from '@dzlzv/hydra-common'

export type QueryEventProcessorResult = void | Promise<void>
export type EventHandlerFunc = (
  db: DatabaseManager,
  event: SubstrateEvent
) => QueryEventProcessorResult

export interface QueryEventProcessingPack {
  [index: string]: EventHandlerFunc
}

export type HandlerFunc = (...args: any[]) => void | Promise<void>
