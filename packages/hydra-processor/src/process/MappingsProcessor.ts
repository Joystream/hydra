/* eslint-disable @typescript-eslint/naming-convention */
import { makeDatabaseManager } from '@dzlzv/hydra-db-utils'
import { IProcessorSource, GraphQLSource, EventQuery } from '../ingest'
import { HandlerLookupService } from './HandlerLookupService'
import { getConnection, EntityManager } from 'typeorm'
import { logError, formatEventId } from '@dzlzv/hydra-common'
import delay from 'delay'
import pWaitFor from 'p-wait-for'
import Debug from 'debug'

import {
  IProcessorState,
  IProcessorStateHandler,
  ProcessorStateHandler,
} from '../state'

import { conf, getManifest } from '../start/config'

import { eventEmitter, PROCESSED_EVENT } from '../start/events'
import { BlockInterval } from '../start/manifest'
import { error, info } from '../util/log'
import { parseEventId } from '../util/utils'

const debug = Debug('hydra-processor:mappings-processor')

export class MappingsProcessor {
  globalFilterConfig: GlobalFilterConfig
  state!: IProcessorState
  private _started = false
  indexerHead!: number // current indexer head we are aware of

  constructor(
    protected eventsSource: IProcessorSource = new GraphQLSource(),
    protected handlerLookup = new HandlerLookupService(),
    protected stateHandler: IProcessorStateHandler = new ProcessorStateHandler(),
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

    this.state = await this.stateHandler.init()
    await this.handlerLookup.load()

    await pWaitFor(async () => {
      info(`Waiting for the indexer head to be initialized`)
      this.indexerHead = await this.eventsSource.indexerHead()
      return this.indexerHead >= 0
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
      this.indexerHead = await this.eventsSource.indexerHead()
      await delay(conf.POLL_INTERVAL_MS)
    }
  }

  private async awaitIndexer(): Promise<void> {
    debug(
      `Indexer Head: ${this.indexerHead} Last Scanned Block: ${this.state.lastScannedBlock}`
    )

    // here we should eventually listen only to the events
    // For now, we simply wait until the indexer go for at least {MINIMUM_BLOCKS_AHEAD}
    // blocks ahead of the last scanned block
    await pWaitFor(
      () =>
        !this._started ||
        this.indexerHead - this.state.lastScannedBlock > conf.MIN_BLOCKS_AHEAD
    )
  }

  // Long running loop where events are fetched and the mappings are applied
  private async processingLoop(): Promise<void> {
    while (this.shouldWork()) {
      try {
        await this.awaitIndexer()
        const queries = nextEventQueries(this)

        const events = await this.eventsSource.nextBatch(
          queries,
          conf.BATCH_SIZE
        )

        debug(`Processing new batch of events of size: ${events.length}`)

        for (const event of events) {
          await getConnection().transaction(async (manager: EntityManager) => {
            this.state = await processEvent(event, () =>
              this.handlerLookup.lookupAndCall({
                dbStore: makeDatabaseManager(manager),
                context: event,
              })
            )
            await this.stateHandler.persist(this.state, manager)
          })
          eventEmitter.emit(PROCESSED_EVENT, event)
        }

        // Even if there were no events, update the last scanned block
        this.state = nextState(this.state, queries)
        await this.stateHandler.persist(this.state)
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

export function nextState(
  state: IProcessorState,
  filter: { block_lte: number }[]
): IProcessorState {
  const lastProcessedEvent = state.lastProcessedEvent || formatEventId(0, 0)
  const { blockHeight } = parseEventId(lastProcessedEvent)
  return {
    lastScannedBlock: Math.min(...filter.map((f) => f.block_lte), blockHeight),
    lastProcessedEvent,
  }
}

export async function processEvent(
  event: { id: string; blockNumber: number },
  handler: () => Promise<void>
): Promise<IProcessorState> {
  debug(`Processing event ${event.id}`)

  debug(`JSON: ${JSON.stringify(event, null, 2)}`)
  await handler()

  debug(`Event ${event.id} done`)

  return {
    lastProcessedEvent: event.id,
    lastScannedBlock: event.blockNumber,
  }
}

export function nextEventQueries(context: ProcessorContext): EventQuery[] {
  const { state, indexerHead, globalFilterConfig } = context
  const { blockInterval, events, extrinsics, blockWindow } = globalFilterConfig
  const globalBlock = {
    id_gt: state.lastProcessedEvent,
    block_gte: Math.max(state.lastScannedBlock, blockInterval.from),
    block_lte: Math.min(
      state.lastScannedBlock + blockWindow,
      indexerHead,
      blockInterval.to
    ),
  }

  return [
    {
      ...globalBlock,
      events,
    },
    {
      ...globalBlock,
      events: ['system.ExtrinsicSuccess'], // TODO: make success-only configurable
      extrinsics,
    },
  ]
}
