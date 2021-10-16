import { loadState } from '../db/dal'
import { ProcessedEventsLogEntity } from '../entities'
import { getRepository, EntityManager } from 'typeorm'
import { IProcessorState, IStateKeeper } from './IStateKeeper'
import { getProcessorSource, IProcessorSource } from '../ingest'

import Debug from 'debug'
import pThrottle from 'p-throttle'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import { getConfig as conf, getManifest } from '../start/config'
import { isInRange, Range, parseEventId, info, warn } from '../util'
import { formatEventId, SubstrateEvent } from '@subsquid/hydra-common'
import { IndexerStatus } from '.'
import { validateIndexerVersion } from './version'
const debug = Debug('hydra-processor:processor-state-handler')

export class StateKeeper implements IStateKeeper {
  private processorState!: IProcessorState
  private indexerStatus!: IndexerStatus
  private processorSource!: IProcessorSource

  constructor() {
    // this.indexerStatus = {
    //   head: -1,
    //   chainHeight: -1,
    // }
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
        `Last block: ${this.processorState.lastScannedBlock} \t: ${syncStatus}`
      )
    })

    // additionally log every status change
    eventEmitter.on(
      ProcessorEvents.PROCESSED_EVENT,
      (event: SubstrateEvent) => {
        this.processorState.lastProcessedEvent = event.id
      }
    )
    eventEmitter.on(ProcessorEvents.STATE_CHANGE, stateLog)
  }

  async updateState(
    newState: Partial<IProcessorState>,
    em?: EntityManager
  ): Promise<void> {
    if (newState.lastScannedBlock === this.processorState.lastScannedBlock) {
      return
    }

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

  async init(): Promise<IProcessorState> {
    const lastState = await loadState(conf().ID)

    const processorSource = await getProcessorSource()

    this.indexerStatus = await processorSource.getIndexerStatus()

    info(`Hydra Indexer version: ${this.indexerStatus.hydraVersion}`)

    const manifest = getManifest()

    if (manifest.indexerVersionRange) {
      validateIndexerVersion(
        this.indexerStatus.hydraVersion,
        manifest.indexerVersionRange
      )
    }
    validateIndexerVersion(this.indexerStatus.hydraVersion, '>=4 <5')

    const range = manifest.mappings.range

    this.processorState = initState(range, lastState)
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
  range: Range,
  lastState: { eventId: string; lastScannedBlock: number } | undefined
): IProcessorState {
  info(
    `Mappings will be executed for blocks in the range [${range.from}, ${range.to}], inclusively `
  )

  if (lastState === undefined) {
    debug(
      `No saved state has been found, setting lastScannedBlock to ${
        range.from - 1
      }`
    )
    return {
      lastScannedBlock: range.from - 1,
      lastProcessedEvent: formatEventId(0, 0),
    }
  }

  if (isInRange(lastState.lastScannedBlock + 1, range)) {
    info(
      `There are already processed blocks in the database. The indexer will continue from block ${
        lastState.lastScannedBlock + 1
      }.`
    )
    return {
      lastProcessedEvent: lastState.eventId,
      lastScannedBlock: lastState.lastScannedBlock,
    }
  }

  if (lastState.lastScannedBlock < range.from) {
    warn(
      `The last processed block ${lastState.lastScannedBlock} is behind the starting block ${range.from}. Make sure it is intended.`
    )
    return {
      lastProcessedEvent: lastState.eventId,
      lastScannedBlock: range.from - 1,
    }
  }

  // Here must be (lastState.lastScannedBlock >= range.to)
  throw new Error(
    `The last processed block ${lastState.lastScannedBlock} is beyond the provided block range.`
  )
}
