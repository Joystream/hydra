import { loadState } from '../db/dal'
import { ProcessedEventsLogEntity } from '../entities'
import { getRepository, EntityManager } from 'typeorm'
import {
  EventBatchExecution,
  EventExecution,
  IProcessorStateKeeper,
} from './IProcessorStateKeeper'

import Debug from 'debug'
import { eventEmitter, PROCESSED_EVENT, STATE_CHANGE } from '../start/events'
import { conf } from '../start/config'
import { IndexerStatus } from '../ingest'
import assert = require('assert')
import { formatEventId } from '@dzlzv/hydra-common'
import { IProcessorState } from '../process'

const debug = Debug('index-builder:processor-state-handler')

export class ProcessorStateKeeper implements IProcessorStateKeeper {
  async eventSuccess({
    event,
    state,
    em,
  }: EventExecution): Promise<IProcessorState> {
    const newState = {
      lastProcessedEvent: event.id,
      lastScannedBlock: event.blockNumber - 1,
    } as IProcessorState

    await this.persist(newState, em)
    eventEmitter.emit(PROCESSED_EVENT, event)
    return newState
  }

  async eventBatchComplete({
    state,
    batchFilters,
  }: EventBatchExecution): Promise<IProcessorState> {
    const lastProcessedEvent = state.lastProcessedEvent || formatEventId(0, 0)
    const newState = {
      lastScannedBlock: Math.min(...batchFilters.map((f) => f.block_lte)),
      lastProcessedEvent,
    }
    await this.persist(newState)
    return newState
  }

  async persist(state: IProcessorState, em?: EntityManager): Promise<void> {
    assert(state.lastProcessedEvent, 'Cannot persist undefined event ID')
    const processed = new ProcessedEventsLogEntity()
    processed.processor = conf.ID
    processed.eventId = state.lastProcessedEvent
    processed.lastScannedBlock = state.lastScannedBlock

    if (state.indexerStatus) {
      const { head, chainHead } = state.indexerStatus
      processed.indexerHead = head
      processed.chainHead = chainHead
    } else {
      // should never really happen
      processed.indexerHead = -1
      processed.chainHead = -1
    }

    const repository = em
      ? em.getRepository('ProcessedEventsLogEntity')
      : getRepository('ProcessedEventsLogEntity')

    await repository.save(processed)
    eventEmitter.emit(STATE_CHANGE, state)
  }

  async init(blockInterval?: { from: number }): Promise<IProcessorState> {
    const lastState = await loadState(conf.ID)

    const state = {
      chainHead: -1,
      indexerHead: -1,
      ...initState(blockInterval, lastState),
    }
    eventEmitter.emit(STATE_CHANGE, state)

    return state
  }
}

export function initState(
  blockInterval: { from: number } | undefined,
  lastState: { eventId: string; lastScannedBlock: number } | undefined
): IProcessorState {
  let atBlock = 0
  if (blockInterval) {
    debug(
      `Mappings will be applied to block interval: ${JSON.stringify(
        blockInterval
      )}`
    )
    atBlock = blockInterval.from || 0
  }

  if (atBlock > 0) {
    debug(`Got block height hint: ${atBlock}`)
  }

  if (lastState) {
    debug(`Found the most recent processed event ${lastState.eventId}`)
    if (atBlock > lastState.lastScannedBlock) {
      debug(
        `WARNING! There are processed events in the processor logs.
          Last processed event id ${lastState.eventId}. The indexer 
          will continue from block ${lastState.lastScannedBlock} and ignore the block height hint.`
      )
    }
    return {
      lastProcessedEvent: lastState.eventId,
      lastScannedBlock: lastState.lastScannedBlock,
    }
  }

  return {
    lastScannedBlock: atBlock,
    lastProcessedEvent: undefined,
  }
}
