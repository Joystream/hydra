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
  MappingFilter,
  MappingType,
} from './IEventQueue'

const debug = Debug('hydra-processor:event-queue')

export function getMappingFilter(): MappingFilter {
  const {
    mappings: {
      eventHandlers,
      extrinsicHandlers,
      blockInterval,
      preBlockHooks,
      postBlockHooks,
    },
  } = getManifest()
  return {
    events: Object.keys(eventHandlers),
    extrinsics: Object.keys(extrinsicHandlers),
    blockInterval,
    hasPreHooks: preBlockHooks.length > 0,
    hasPostHooks: postBlockHooks.length > 0,
  }
}

export class EventQueue implements IEventQueue {
  currentFilter!: FilterConfig
  private _started = false
  indexerStatus!: IndexerStatus
  private queue: EventContext[] = []

  constructor(
    protected stateKeeper: IStateKeeper = getStateKeeper(),
    protected eventsSource: IEventsSource = getEventSource(),
    protected globalFilter: MappingFilter = getMappingFilter()
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

    const { events, extrinsics, blockInterval } = this.globalFilter
    this.currentFilter = {
      id: {
        gt: lastProcessedEvent,
      },
      block: {
        gte: Math.max(lastScannedBlock, blockInterval.from),
        lte: Math.min(
          lastScannedBlock + conf.BLOCK_WINDOW,
          this.indexerStatus.head,
          blockInterval.to
        ),
      },
      events,
      extrinsics,
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
    return this.currentFilter.block.lte <= this.globalFilter.blockInterval.to
  }

  async nextBatch(size: number): Promise<EventContext[]> {
    await pWaitFor(() => this.queue.length > 0)
    const toReturn = this.queue.splice(0, size)
    eventEmitter.emit(ProcessorEvents.QUEUE_SIZE_CHANGE, this.queue.length)
    return toReturn
  }

  lastScannedBlock(): number {
    return Math.max(
      this.currentFilter.block.gte - 1,
      parseEventId(this.currentFilter.id.gt).blockHeight - 1
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

      const executions: EventContext[] = await this.fetchNextBatch()

      this.queue.push(...executions)

      debug(`Pushed ${executions.length} events to the queue`)

      if (executions.length > 0) {
        this.currentFilter.id.gt = last(executions)?.event.id as string
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
          \tLast Fetched Event: ${this.currentFilter.id.gt}`
      )
    }
  }

  private updateLastScannedBlock() {
    if (this.currentFilter.block.lte === this.globalFilter.blockInterval.to) {
      info(
        `All the events up to block ${this.globalFilter.blockInterval.to} has been fetched. Stopping`
      )
      this.stop()
    }
    this.currentFilter.block.gte = this.currentFilter.block.lte
    this.currentFilter.block.lte = Math.min(
      this.currentFilter.block.lte + conf.BLOCK_WINDOW,
      this.indexerStatus.head,
      this.globalFilter.blockInterval.to
    )
  }

  private async fetchNextBatch() {
    const queries = prepareEventQueries(this.currentFilter)

    const events = await this.eventsSource.nextBatch(queries)

    let executions: EventContext[] = []
    for (const e in events) {
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
