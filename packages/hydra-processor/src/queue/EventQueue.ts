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
  _started = false
  _hasNext = true
  indexerStatus!: IndexerStatus
  queue: EventContext[] = []
  stateKeeper!: IStateKeeper
  eventSource!: IEventsSource
  globalFilter!: MappingFilter

  async init(): Promise<void> {
    info(`Waiting for the indexer head to be initialized`)

    this.stateKeeper = await getStateKeeper()
    this.eventSource = await getEventSource()
    this.globalFilter = getMappingFilter()

    await pWaitFor(async () => {
      this.indexerStatus = await this.eventSource.indexerStatus()
      return this.indexerStatus.head >= 0
    })

    this.currentFilter = this.getInitialFilter()
  }

  getInitialFilter(): FilterConfig {
    const { lastScannedBlock, lastProcessedEvent } = this.stateKeeper.getState()
    const { events, extrinsics } = this.globalFilter
    return {
      id: {
        gt: lastProcessedEvent,
      },
      block: this.nextBlockRange({
        lte: lastScannedBlock,
        gte: lastScannedBlock,
      }),
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
    this._hasNext = false
  }

  async pollIndexer(): Promise<void> {
    // TODO: uncomment this block when eventSource will emit
    // this.eventsSource.on('NewIndexerHead', (h: number) => {
    //   debug(`New Indexer Head: ${h}`)
    //   this.indexerHead = h
    // });
    // For now, simply update indexerHead regularly
    while (this._started) {
      this.indexerStatus = await this.eventSource.indexerStatus()
      eventEmitter.emit(
        ProcessorEvents.INDEXER_STATUS_CHANGE,
        this.indexerStatus
      )
      await delay(conf.POLL_INTERVAL_MS)
    }
  }

  hasNext(): boolean {
    return this._hasNext
  }

  async nextBatch(size: number): Promise<EventContext[]> {
    await pWaitFor(() => this.queue.length > 0 || !this.hasNext())
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
    while (this._started) {
      await pWaitFor(
        () =>
          this.queue.length <=
          conf.EVENT_QUEUE_MAX_CAPACITY - conf.QUEUE_BATCH_SIZE
      )

      debug(
        `Queue size: ${this.queue.length}, max capacity: ${conf.EVENT_QUEUE_MAX_CAPACITY}`
      )

      const events: EventContext[] = await this.fetchNextBatch()

      this.queue.push(...events)

      debug(`Pushed ${events.length} events to the queue`)

      if (events.length > 0) {
        this.currentFilter.id.gt = last(events)?.event.id as string
      }

      if (events.length < conf.QUEUE_BATCH_SIZE) {
        // This means that we have exhausted all the events up to lastScannedblock + WINDOW
        if (conf.VERBOSE)
          debug(
            `Fully fetched the next batch of ${conf.QUEUE_BATCH_SIZE}: fetched only ${events.length} events`
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
    if (this.currentFilter.block.lte >= this.globalFilter.blockInterval.to) {
      info(
        `All the events up to block ${this.globalFilter.blockInterval.to} has been fetched. Stopping`
      )
      this.stop()
    }
    this.currentFilter.block = this.nextBlockRange(this.currentFilter.block)
  }

  nextBlockRange(current: {
    lte: number
    gte: number
  }): { lte: number; gte: number } {
    return {
      gte: current.lte,
      lte: Math.min(
        current.lte + conf.BLOCK_WINDOW,
        this.globalFilter.blockInterval.to,
        this.indexerStatus.head
      ),
    }
  }

  private async fetchNextBatch() {
    const queries = prepareEventQueries(this.currentFilter)

    const events = await this.eventSource.nextBatch(queries)

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
