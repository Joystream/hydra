import { loadState } from '../db/dal'
import { ProcessedEventsLogEntity } from '../entities'
import { getRepository, EntityManager } from 'typeorm'
import { IProcessorState, IStateKeeper } from './IStateKeeper'

import Debug from 'debug'
import pThrottle from 'p-throttle'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import { getConfig as conf } from '../start/config'
import { parseEventId } from '../util/utils'
import { formatEventId } from '@dzlzv/hydra-common'
import { IndexerStatus } from '.'
import { info } from '../util/log'
const debug = Debug('index-builder:processor-state-handler')

export class StateKeeper implements IStateKeeper {
  private processorState!: IProcessorState
  private indexerStatus: IndexerStatus

  constructor() {
    this.indexerStatus = {
      head: -1,
      chainHeight: -1,
    }
    eventEmitter.on(
      ProcessorEvents.INDEXER_STATUS_CHANGE,
      (indexerStatus) => (this.indexerStatus = indexerStatus)
    )

    const throttle = pThrottle({
      limit: 1,
      interval: 1000,
    })

    const stateLog = throttle(() => {
      const syncStatus =
        this.indexerStatus.chainHeight > 0
          ? `${
              this.indexerStatus.chainHeight -
              this.processorState.lastScannedBlock
            } blocks behind`
          : `Connecting to the indexer...`
      info(
        `Last processed event: ${this.processorState.lastProcessedEvent} \tSync status: ${syncStatus}`
      )
    })

    // additionally log every status change
    eventEmitter.on(ProcessorEvents.STATE_CHANGE, stateLog)
  }

  async updateState(
    newState: Partial<IProcessorState>,
    em?: EntityManager
  ): Promise<void> {
    this.processorState = {
      lastProcessedEvent:
        newState.lastProcessedEvent || this.processorState.lastProcessedEvent,
      lastScannedBlock:
        newState.lastScannedBlock || this.processorState.lastScannedBlock,
    }

    const { lastScannedBlock, lastProcessedEvent } = this.processorState

    this.processorState.lastScannedBlock = Math.max(
      lastScannedBlock,
      parseEventId(lastProcessedEvent).blockHeight - 1
    )

    const processed = new ProcessedEventsLogEntity()
    processed.processor = conf().ID
    processed.eventId = this.processorState.lastProcessedEvent
    processed.lastScannedBlock = this.processorState.lastScannedBlock
    processed.chainHead = this.indexerStatus.chainHeight
    processed.indexerHead = this.indexerStatus.head

    const repository = em
      ? em.getRepository('ProcessedEventsLogEntity')
      : getRepository('ProcessedEventsLogEntity')

    await repository.save(processed)
    eventEmitter.emit(ProcessorEvents.STATE_CHANGE, this.processorState)
  }

  async init(blockInterval?: { from: number }): Promise<IProcessorState> {
    const lastState = await loadState(conf().ID)

    this.processorState = initState(blockInterval, lastState)
    eventEmitter.emit(ProcessorEvents.STATE_CHANGE, this.processorState)

    return this.processorState
  }

  getState(): IProcessorState {
    return this.processorState
  }

  getIndexerStatus(): IndexerStatus {
    return this.indexerStatus
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
    lastProcessedEvent: formatEventId(0, 0),
  }
}
