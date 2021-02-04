import { loadState } from '../db/dal'
import { ProcessedEventsLogEntity } from '../entities'
import { getRepository, EntityManager } from 'typeorm'
import { IProcessorStateHandler } from './IProcessorStateHandler'
import { IProcessorState } from './IProcessorState'
import Debug from 'debug'
import { eventEmitter, STATE_CHANGE } from '../start/events'
import { conf } from '../start/config'
import assert = require('assert')

const debug = Debug('index-builder:processor-state-handler')

export class ProcessorStateHandler implements IProcessorStateHandler {
  async persist(state: IProcessorState, em?: EntityManager): Promise<void> {
    assert(state.lastProcessedEvent, 'Cannot persist undefined event ID')
    const processed = new ProcessedEventsLogEntity()
    processed.processor = conf.ID
    processed.eventId = state.lastProcessedEvent
    processed.lastScannedBlock = state.lastScannedBlock
    const repository = em
      ? em.getRepository('ProcessedEventsLogEntity')
      : getRepository('ProcessedEventsLogEntity')

    await repository.save(processed)
    eventEmitter.emit(STATE_CHANGE, state)
  }

  async init(blockInterval?: { from: number }): Promise<IProcessorState> {
    const lastState = await loadState(conf.ID)

    const state = initState(blockInterval, lastState)
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
