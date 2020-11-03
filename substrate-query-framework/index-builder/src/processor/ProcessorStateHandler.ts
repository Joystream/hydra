import { loadState } from '../db/dal'
import Debug from 'debug'
import assert = require('assert')
import { ProcessedEventsLogEntity } from '../entities'
import { getRepository } from 'typeorm'
import Container, { Service } from 'typedi'
import { EventEmitter } from 'events'

const debug = Debug('index-builder:processor-state-handler')

export interface IProcessorState {
  lastProcessedEvent: string | undefined
  lastScannedBlock: number
}

export interface IProcessorStateHandler {
  persist(state: IProcessorState): Promise<void>
  init(fromBlock?: number): Promise<IProcessorState>

  /**
   * Explicity expose 'on' method from EventEmitter to ensure listeners can listen to events
   */
  on(event: string | symbol, listener: (...args: any[]) => void): this
}

@Service('ProcessorStateHander')
export class ProcessorStateHandler
  extends EventEmitter
  implements IProcessorStateHandler {
  constructor(public readonly processorID = 'hydra-processor') {
    super()
    Container.set('ProcessorStateHandler', this)
  }

  async persist(state: IProcessorState): Promise<void> {
    assert(state.lastProcessedEvent, 'Cannot persist undefined event ID')
    const processed = new ProcessedEventsLogEntity()
    processed.processor = this.processorID
    processed.eventId = state.lastProcessedEvent
    processed.lastScannedBlock = state.lastScannedBlock

    await getRepository('ProcessedEventsLogEntity').save(processed)
    this.emit('STATE_CHANGE', state)
  }

  async init(atBlock = 0): Promise<IProcessorState> {
    if (atBlock > 0) {
      debug(`Got block height hint: ${atBlock}`)
    }

    const lastState = await loadState(this.processorID)

    if (lastState) {
      debug(`Found the most recent processed event ${lastState.eventId}`)
      if (atBlock > lastState.lastScannedBlock) {
        debug(
          `WARNING! Existing processed history detected on the database!
          Last processed event id ${lastState.eventId}. The indexer 
          will continue from block ${lastState.lastScannedBlock} and ignore the block height hint.`
        )
      }
      return {
        lastProcessedEvent: lastState.eventId,
        lastScannedBlock: lastState.lastScannedBlock,
      }
    }

    const state = {
      lastScannedBlock: atBlock,
      lastProcessedEvent: undefined,
    }

    this.emit('STATE_CHANGE', state)

    return state
  }
}
