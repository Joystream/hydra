import { IEventsSource, IndexerQuery, getEventSource } from '../ingest'
import { conf, getManifest } from '../start/config'
import { info } from '../util/log'
import pWaitFor from 'p-wait-for'
import delay from 'delay'
import Debug from 'debug'
import { last } from 'lodash'
import { IndexerStatus, IStateKeeper, getStateKeeper } from '../state'
import { parseEventId } from '../util/utils'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import {
  EventContext,
  FilterConfig,
  IEventQueue,
  MappingType,
} from './IEventQueue'

const debug = Debug('hydra-processor:event-queue')

export class EventQueue implements IEventQueue {
  globalFilterConfig!: FilterConfig
  private _started = false
  indexerStatus!: IndexerStatus
  private queue: EventContext[] = []

  constructor(
    protected stateKeeper: IStateKeeper = getStateKeeper(),
    protected eventsSource: IEventsSource = getEventSource(),
    protected mappings = getManifest().mappings
  ) {}

  async init(): Promise<void> {
    info(`Waiting for the indexer head to be initialized`)

    await pWaitFor(async () => {
      this.indexerStatus = await this.eventsSource.indexerStatus()
      return this.indexerStatus.head >= 0
    })

    const {
      lastScannedBlock,
      lastProcessedEvent,
    } = await this.stateKeeper.init()

    this.globalFilterConfig = {
      id: {
        gt: lastProcessedEvent,
      },
      block: {
        gte: Math.max(lastScannedBlock, this.mappings.blockInterval.from),
        lte: Math.min(
          lastScannedBlock + conf.BLOCK_WINDOW,
          this.indexerStatus.head,
          this.mappings.blockInterval.to
        ),
      },
      events: Object.keys(this.mappings.eventHandlers),
      extrinsics: Object.keys(this.mappings.extrinsicHandlers),
      limit: conf.QUEUE_BATCH_SIZE,
    }
  }

  async start(): Promise<void> {
    this._started = true

    info('Starting the event queue')

    await Promise.all([this.pollIndexer(), this.queryIndexer()])
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
      eventEmitter.emit(
        ProcessorEvents.INDEXER_STATUS_CHANGE,
        this.indexerStatus
      )
      await delay(conf.POLL_INTERVAL_MS)
    }
  }

  hasNext(): boolean {
    return this.globalFilterConfig.block.lte <= this.mappings.blockInterval.to
  }

  async nextBatch(size: number): Promise<EventContext[]> {
    await pWaitFor(() => this.queue.length > 0)
    const toReturn = this.queue.splice(0, size)
    eventEmitter.emit(ProcessorEvents.QUEUE_SIZE_CHANGE, this.queue.length)
    return toReturn
  }

  lastScannedBlock(): number {
    return Math.max(
      this.globalFilterConfig.block.gte - 1,
      parseEventId(this.globalFilterConfig.id.gt).blockHeight - 1
    )
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  // Long running loop where events are fetched and the mappings are applied
  private async queryIndexer(): Promise<void> {
    while (this.shouldWork()) {
      await pWaitFor(
        () =>
          this.queue.length <=
          conf.EVENT_QUEUE_MAX_CAPACITY - conf.QUEUE_BATCH_SIZE
      )

      debug(
        `Queue size: ${this.queue.length}, max capacity: ${conf.EVENT_QUEUE_MAX_CAPACITY}`
      )

      let executions: EventContext[] = await this.fetchNextBatch()

      this.queue.push(...executions)

      debug(`Pushed ${executions.length} events to the queue`)

      if (executions.length > 0) {
        this.globalFilterConfig.id.gt = last(executions)?.event.id as string
      }

      if (executions.length < conf.QUEUE_BATCH_SIZE) {
        // This means that we have exhausted all the events up to lastScannedblock + WINDOW
        if (conf.VERBOSE)
          debug(
            `Fully fetched the next batch of ${conf.QUEUE_BATCH_SIZE}: fetched only ${executions.length} events`
          )

        this.updateLastScannedBlock()
      }

      eventEmitter.emit(ProcessorEvents.QUEUE_SIZE_CHANGE, this.queue.length)

      debug(
        `Event queue state:
          \tIndexer head: ${this.indexerStatus.head}
          \tChain head: ${this.indexerStatus.chainHeight} 
          \tLast Fetched Event: ${this.globalFilterConfig.id.gt}`
      )
    }
  }

  private updateLastScannedBlock() {
    if (this.globalFilterConfig.block.lte === this.mappings.blockInterval.to) {
      info(
        `All the events up to block ${this.mappings.blockInterval.to} has been fetched. Stopping`
      )
      this.stop()
    }
    this.globalFilterConfig.block.gte = this.globalFilterConfig.block.lte
    this.globalFilterConfig.block.lte = Math.min(
      this.globalFilterConfig.block.lte + conf.BLOCK_WINDOW,
      this.indexerStatus.head,
      this.mappings.blockInterval.to
    )
  }

  private async fetchNextBatch() {
    const queries = prepareEventQueries(this.globalFilterConfig)

    const events = await this.eventsSource.nextBatch(queries)

    let executions: EventContext[] = []
    for (let e in events) {
      const type = e as keyof typeof events
      executions.push(
        ...(events[type] || []).map((event) => {
          return { event, type }
        })
      )
    }

    executions = executions
      .sort((e1, e2) => (e1.event.id < e2.event.id ? -1 : 1))
      .slice(0, conf.QUEUE_BATCH_SIZE)

    return executions
  }

  private shouldWork(): boolean {
    return this._started && this.hasNext()
  }
}

export function prepareEventQueries(
  filter: FilterConfig
): { [key in MappingType]?: IndexerQuery } {
  const { events, extrinsics } = filter
  const queries: { [key in MappingType]?: IndexerQuery } = {}

  if (events.length > 0) {
    queries[MappingType.EVENT] = {
      ...filter,
      event: { in: events },
    } as IndexerQuery
  }

  if (extrinsics.length > 0) {
    queries[MappingType.EXTRINSIC] = {
      ...filter,
      event: { in: ['system.ExtrinsicSuccess'] }, // TODO: make success-only configurable
      extrinsic: { in: extrinsics },
    }
  }

  return queries
}
