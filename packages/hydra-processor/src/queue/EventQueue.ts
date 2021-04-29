import { getEventSource } from '../ingest'
import { getConfig as conf, getManifest } from '../start/config'
import { info } from '../util/log'
import pWaitFor from 'p-wait-for'
import delay from 'delay'
import Debug from 'debug'
import { last, first, union, mapValues } from 'lodash'
import { IndexerStatus, IStateKeeper, getStateKeeper } from '../state'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import {
  BlockData,
  IEventQueue,
  MappingFilter,
  HandlerKind,
  RangeFilter,
  MappingContext,
} from './IEventQueue'
import { BlockRange, MappingsDef } from '../start/manifest'
import { SubstrateBlock, SubstrateEvent } from '@dzlzv/hydra-common'
import {
  AsJson,
  GraphQLQuery,
  IndexerQuery,
  IProcessorSource,
} from '../ingest/IProcessorSource'

const debug = Debug('hydra-processor:event-queue')

export function getMappingFilter(mappingsDef: MappingsDef): MappingFilter {
  const {
    eventHandlers,
    extrinsicHandlers,
    range,
    preBlockHooks,
    postBlockHooks,
  } = mappingsDef

  return {
    events: eventHandlers.map((h) => h.event),
    extrinsics: {
      names: extrinsicHandlers.map((h) => h.extrinsic),
      triggerEvents: extrinsicHandlers.reduce<string[]>(
        (acc, h) => union(acc, h.triggerEvents),
        [] as string[]
      ),
    },
    range,
    blockHooks: union(preBlockHooks, postBlockHooks).reduce<BlockRange[]>(
      (acc, h) => union(acc, h.range ? [h.range] : []),
      []
    ),
  }
}

export class EventQueue implements IEventQueue {
  _started = false
  _hasNext = true
  indexerStatus!: IndexerStatus
  eventQueue: MappingContext[] = []
  stateKeeper!: IStateKeeper
  eventSource!: IProcessorSource
  mappingFilter!: MappingFilter
  rangeFilter!: RangeFilter
  indexerQueries!: { [key in HandlerKind]?: Partial<IndexerQuery> }

  async init(): Promise<void> {
    info(`Waiting for the indexer head to be initialized`)

    this.stateKeeper = await getStateKeeper()
    this.eventSource = await getEventSource()
    this.mappingFilter = getMappingFilter(getManifest().mappings)

    await pWaitFor(async () => {
      this.indexerStatus = await this.eventSource.indexerStatus()
      return this.indexerStatus.head >= 0
    })

    this.rangeFilter = this.getInitialRange()
    this.indexerQueries = prepareIndexerQueries(this.mappingFilter)
  }

  getInitialRange(): RangeFilter {
    const { lastScannedBlock, lastProcessedEvent } = this.stateKeeper.getState()

    return {
      id: {
        gt: lastProcessedEvent,
      },
      block: this.nextBlockRange({
        lte: lastScannedBlock,
      }),

      limit: conf().QUEUE_BATCH_SIZE,
    }
  }

  async start(): Promise<void> {
    this._started = true

    info('Starting the event queue')

    await Promise.all([this.pollIndexer(), this.fill()])
  }

  stop(): void {
    this._started = false
  }

  async pollIndexer(): Promise<void> {
    // TODO: uncomment this block when eventSource will emit
    // this.eventsSource.on('NewIndexerHead', (h: number) => {
    //   debug(`New Indexer Head: ${h}`)
    //   this.indexerHead = h
    // });
    // For now, simply update indexerHead regularly
    while (this._started && this._hasNext) {
      this.indexerStatus = await this.eventSource.indexerStatus()
      eventEmitter.emit(
        ProcessorEvents.INDEXER_STATUS_CHANGE,
        this.indexerStatus
      )
      await delay(conf().POLL_INTERVAL_MS)
    }
  }

  hasNext(): boolean {
    return this._hasNext
  }

  private async poll(): Promise<MappingContext | undefined> {
    await pWaitFor(() => this.eventQueue.length > 0 || !this._hasNext)
    const out = this.eventQueue.shift()
    if (this.eventQueue.length === 0) {
      eventEmitter.emit(ProcessorEvents.QUEUE_DRAINED, out)
    }
    return out
  }

  async *blocks(): AsyncGenerator<BlockData, void, void> {
    const newBlock = (eventCtx: MappingContext): BlockData => {
      const { event } = eventCtx
      return {
        blockNumber: event.blockNumber,
        eventCtxs: [eventCtx],
      }
    }
    while (this._started) {
      debug(`Sealing new block`)

      let eventCtx = await this.poll()
      if (eventCtx === undefined) {
        debug(`The queue is empty and all the events were fetched`)
        return
      }
      const block = newBlock(eventCtx)

      debug(`Next block: ${block.blockNumber}`)
      // wait until all the events up to blockNumber are fully fetched
      pWaitFor(() => this.rangeFilter.block.gt >= block.blockNumber)

      while (
        !this.isEmpty() &&
        (first(this.eventQueue) as MappingContext).event.blockNumber ===
          block.blockNumber
      ) {
        eventCtx = (await this.poll()) as MappingContext
        block.eventCtxs.push(eventCtx)
      }

      // the event is from a new block, yield the current
      debug(`Yielding block ${block.blockNumber}`)
      if (conf().VERBOSE)
        debug(`Block contents: ${JSON.stringify(block, null, 2)}`)

      yield block
    }
  }

  isEmpty(): boolean {
    return this.eventQueue.length === 0
  }

  // Long running loop where events are fetched
  private async fill(): Promise<void> {
    while (this._started && this._hasNext) {
      await pWaitFor(
        () =>
          this.eventQueue.length <=
          conf().EVENT_QUEUE_MAX_CAPACITY - conf().QUEUE_BATCH_SIZE
      )

      debug(
        `Queue size: ${this.eventQueue.length}, max capacity: ${
          conf().EVENT_QUEUE_MAX_CAPACITY
        }`
      )

      const blocks = await this.fetchBlocks()

      const events: MappingContext[] = await this.fetchNextBatch()

      this.eventQueue.push(...events)

      debug(`Pushed ${events.length} events to the queue`)

      if (events.length > 0) {
        this.rangeFilter.id.gt = last(events)?.event.id as string
      }

      if (events.length < conf().QUEUE_BATCH_SIZE) {
        // This means that we have exhausted all the events up to lastScannedblock + WINDOW
        if (conf().VERBOSE)
          debug(
            `Fully fetched the next batch of ${
              conf().QUEUE_BATCH_SIZE
            }: fetched only ${events.length} events`
          )

        this.shiftRangeFilter()
      }

      eventEmitter.emit(
        ProcessorEvents.QUEUE_SIZE_CHANGE,
        this.eventQueue.length
      )

      debug(
        `Event queue state:
          \tIndexer head: ${this.indexerStatus.head}
          \tChain head: ${this.indexerStatus.chainHeight} 
          \tQueue size: ${this.eventQueue.length}
          \tLast fetched event: ${this.rangeFilter.id.gt}`
      )
    }
  }

  private async fetchBlocks(): Promise<SubstrateBlock[]> {
    const { events, extrinsics } = this.mappingFilter
    const query: GraphQLQuery<SubstrateBlock> = {
      name: 'substrateBlocks',
      fields: [
        'id',
        'hash',
        'parentHash',
        'height',
        'timestamp',
        'stateRoot',
        'runtimeVersion',
        'lastRuntimeUpgrade',
        { 'events': ['id', 'name', 'extrinsic'] },
        { 'extrinsics': ['id', 'name'] },
      ],
      query: {
        where: {
          events: { some: { name: { in: events } } },
          //extrinsics: { some: { name: { in: extrinsics.names } } },
          height: this.rangeFilter.block,
        },
        limit: conf().BLOCK_WINDOW,
        orderBy: { desc: 'height' },
      },
    }
    const blocks = await this.eventSource.executeQueries({ eventBlocks: query })

    return blocks.eventBlocks
  }

  private shiftRangeFilter() {
    if (this.rangeFilter.block.lte >= this.mappingFilter.range.to) {
      info(
        `All the events up to block ${this.mappingFilter.range.to} has been fetched.`
      )
      this.rangeFilter.block.gt = this.mappingFilter.range.to
      this._hasNext = false
      return
    }

    this.rangeFilter.block = this.nextBlockRange(this.rangeFilter.block)
    eventEmitter.emit(
      ProcessorEvents.QUEUE_LAST_COMPLETE_BLOCK_CHANGE,
      this.rangeFilter.block.gt
    )
  }

  nextBlockRange(last: { lte: number }): { gt: number; lte: number } {
    return {
      gt: last.lte,
      lte: Math.min(
        last.lte + conf().BLOCK_WINDOW,
        this.mappingFilter.range.to,
        this.indexerStatus.head
      ),
    }
  }

  private async fetchNextBatch() {
    const queries = mapValues(
      this.indexerQueries,
      // add range and limit to the indexer queries
      (query) => ({ ...this.rangeFilter, ...query } as IndexerQuery)
    )

    debug(`Fetching next batch`)
    const events = await this.eventSource.nextBatch(queries)

    // collect the events object into an array with types
    const trimmed = sortAndTrim(events)
    if (conf().VERBOSE) {
      debug(
        `Enqueuing events: ${JSON.stringify(trimmed.map((e) => e.event.id))}`
      )
    }
    return trimmed
  }
}

/**
 *
 * @param events an object containg events for different mapping types
 * @param size output batch size
 * @returns an array of events enriched with the mapping type
 */
export function sortAndTrim(
  events: { [key in HandlerKind]?: SubstrateEvent[] },
  size = conf().QUEUE_BATCH_SIZE
): MappingContext[] {
  // collect all mapping type event arrays into a single big array
  let mappingData: MappingContext[] = []
  for (const e in events) {
    const kind = e as keyof typeof events
    mappingData.push(
      ...(events[kind] || []).map((event) => {
        return { event, kind }
      })
    )
  }

  // sort the events so that the mappings are exectuted in the right order
  mappingData = mappingData
    .sort((e1, e2) => (e1.event.id < e2.event.id ? -1 : 1))
    .slice(0, size)

  return mappingData
}

export function prepareIndexerQueries(
  filter: MappingFilter
): { [key in HandlerKind]?: Partial<IndexerQuery> } {
  const { events, extrinsics } = filter
  const queries: { [key in HandlerKind]?: Partial<IndexerQuery> } = {}

  if (events.length > 0) {
    queries[HandlerKind.EVENT] = {
      event: { in: events },
    }
  }

  const { names, triggerEvents } = extrinsics
  if (names.length > 0) {
    queries[HandlerKind.EXTRINSIC] = {
      event: { in: triggerEvents },
      extrinsic: { in: names },
    }
  }

  // TODO: block queries here

  debug(`Queries: ${JSON.stringify(queries, null, 2)}`)
  return queries
}

export function prepareBlockQueries(
  filter: MappingFilter
): GraphQLQuery<SubstrateBlock> {
  const { events, extrinsics } = filter

  return {
    name: 'substrateBlocks',
    fields: [
      'id',
      'hash',
      'parentHash',
      'stateRoot',
      'runtimeVersion',
      'lastRuntimeUpgrade',
      'lastRuntimeUpgrade',
      { 'events': ['id', 'name'] },
      { 'extrinsics': ['id', 'name'] },
    ],
    query: {
      where: {
        events: { some: { name: { in: events } } },
        extrinsics: { some: { name: { in: extrinsics.names } } },
      },
    },
  }
}
