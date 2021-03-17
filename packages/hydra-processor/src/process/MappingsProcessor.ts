/* eslint-disable @typescript-eslint/naming-convention */
import {
  IEventsSource,
  GraphQLSource,
  EventQuery,
  IndexerStatus,
} from '../ingest'
import { logError } from '@dzlzv/hydra-common'
import delay from 'delay'
import pWaitFor from 'p-wait-for'
import Debug from 'debug'

import {
  IProcessorState,
  IProcessorStateKeeper,
  ProcessorStateKeeper,
} from '../state'

import { conf, getManifest } from '../start/config'

import { BlockInterval } from '../start/manifest'
import { error, info } from '../util/log'
import { MappingsExecutor } from './MappingsExecutor'

const debug = Debug('hydra-processor:mappings-processor')

export interface IProcessorState {
  lastProcessedEvent: string | undefined
  lastScannedBlock: number
  indexerStatus?: IndexerStatus
}

export class MappingsProcessor {
  globalFilterConfig: GlobalFilterConfig
  state!: IProcessorState
  private _started = false
  //indexerStatus!: IndexerStatus // current indexer head we are aware of

  constructor(
    protected eventsSource: IEventsSource = new GraphQLSource(),
    protected mappingsExecutor = new MappingsExecutor(),
    protected stateKeeper: IProcessorStateKeeper = new ProcessorStateKeeper(),
    protected mappings = getManifest().mappings
  ) {
    this.globalFilterConfig = {
      blockInterval: mappings.blockInterval,
      events: Object.keys(mappings.eventHandlers),
      extrinsics: Object.keys(mappings.extrinsicHandlers),
      blockWindow: conf.BLOCK_WINDOW,
    }
  }

  async start(): Promise<void> {
    info('Starting the processor')
    this._started = true

    this.state = await this.stateKeeper.init()
    await this.mappingsExecutor.init()

    await pWaitFor(async () => {
      info(`Waiting for the indexer head to be initialized`)
      this.indexerStatus = await this.eventsSource.indexerStatus()
      return this.indexerStatus.head >= 0
    })
    await Promise.all([this.pollIndexer(), this.processingLoop()])
  }

  stop(): void {
    this._started = false
  }

  get stopped(): boolean {
    return !this._started
  }

  async pollIndexer(): Promise<void> {
    // TODO: uncomment this block when eventSource will emit
    // this.eventsSource.on('NewIndexerHead', (h: number) => {
    //   debug(`New Indexer Head: ${h}`)
    //   this.indexerHead = h
    // });
    // For now, simply update indexerHead regularly
    while (this._started) {
      this.indexerStatus = await this.eventsSource.indexerStatus()
      await delay(conf.POLL_INTERVAL_MS)
    }
  }

  private async awaitIndexer(): Promise<void> {
    // here we should eventually listen only to the events
    // For now, we simply wait until the indexer go for at least {MINIMUM_BLOCKS_AHEAD}
    // blocks ahead of the last scanned block
    await pWaitFor(
      () =>
        !this._started ||
        this.indexerStatus.head - this.state.lastScannedBlock >
          conf.MIN_BLOCKS_AHEAD
    )
  }

  // Long running loop where events are fetched and the mappings are applied
  private async processingLoop(): Promise<void> {
    while (this.shouldWork()) {
      try {
        await this.awaitIndexer()
        const queries = prepareEventQueries({
          state: this.state,
          indexerHead: this.indexerStatus.head,
          globalFilterConfig: this.globalFilterConfig,
        })

        const events = await this.eventsSource.nextBatch(
          queries,
          conf.BATCH_SIZE
        )

        debug(`Processing new batch of events of size: ${events.length}`)

        await this.mappingsExecutor.executeMappings(
          events,
          async ({ event, em }) => {
            this.state = await this.stateKeeper.eventSuccess({
              event,
              indexerStatus: this.indexerStatus,
              em,
            })
          }
        )

        if (events.length < conf.BATCH_SIZE) {
          // This means that we have exhausted all the events in the current
          // block interval and should updateLastScanned block
          if (conf.VERBOSE)
            debug(
              `Batch of size ${conf.BATCH_SIZE} complete: ${events.length} events`
            )

          this.state = await this.stateKeeper.eventBatchComplete({
            state: this.state,
            indexerStatus: this.indexerStatus,
            batchFilters: queries,
          })
        }

        info(
          `Indexer head: ${this.indexerStatus.head}; Chain head: ${this.indexerStatus.chainHead}; Last Processed Block: ${this.state.lastScannedBlock}`
        )
      } catch (e) {
        error(`Stopping the proccessor due to errors: ${logError(e)}`)
        this.stop()
        throw new Error(e)
      }
    }
    debug(
      `The processor has stopped at state: ${JSON.stringify(
        this.state,
        null,
        2
      )}`
    )
  }

  private shouldWork(): boolean {
    return (
      this._started &&
      this.state.lastScannedBlock <= this.globalFilterConfig.blockInterval.to
    )
  }
}

export interface GlobalFilterConfig {
  blockWindow: number
  blockInterval: BlockInterval
  events: string[]
  extrinsics: string[]
}

export interface ProcessorContext {
  state: IProcessorState
  indexerHead: number
  globalFilterConfig: GlobalFilterConfig
}

export function prepareEventQueries(context: ProcessorContext): EventQuery[] {
  const { state, indexerHead, globalFilterConfig } = context
  const { blockInterval, events, extrinsics, blockWindow } = globalFilterConfig
  const eventFilter = {
    id_gt: state.lastProcessedEvent,
    block_gte: Math.max(state.lastScannedBlock, blockInterval.from),
    block_lte: Math.min(
      state.lastScannedBlock + blockWindow,
      indexerHead,
      blockInterval.to
    ),
  }

  const queries: EventQuery[] = []

  if (events.length > 0) {
    queries.push({
      ...eventFilter,
      events,
    })
  }

  if (extrinsics.length > 0) {
    queries.push({
      ...eventFilter,
      events: ['system.ExtrinsicSuccess'], // TODO: make success-only configurable
      extrinsics,
    })
  }

  return queries
}
