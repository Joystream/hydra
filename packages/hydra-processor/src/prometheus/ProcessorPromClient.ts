import { Gauge, collectDefaultMetrics } from 'prom-client'
import { IndexerStatus, IProcessorState } from '../state'
import { SubstrateEvent, logError } from '@subsquid/hydra-common'
import Debug from 'debug'
import { countProcessedEvents } from '../db'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import { getConfig as conf, getManifest } from '../start/config'

const debug = Debug('index-builder:processor-prom-client')

export class ProcessorPromClient {
  protected lastScannedBlock = new Gauge({
    name: 'hydra_processor_last_scanned_block',
    help: 'Last block the processor has scanned for events',
  })

  protected lastProcessedBlock = new Gauge({
    name: 'hydra_processor_last_processed_block',
    help: 'Last processed block',
  })

  protected chainHeight = new Gauge({
    name: 'hydra_processor_chain_height',
    help: 'Current substrate chain height as reported by the indexer',
  })

  protected indexerHead = new Gauge({
    name: 'hydra_processor_indexer_head',
    help: 'Last read of the indexer head block',
  })

  protected processedEvents = new Gauge({
    name: 'hydra_processor_processed_events_cnt',
    help: 'Total number of processed events',
    labelNames: ['name'],
  })

  protected eventQueueSize = new Gauge({
    name: 'hydra_processor_event_queue_size',
    help: 'Number of events in the queue',
  })

  protected rangeFrom = new Gauge({
    name: 'hydra_processor_range_from',
    help: 'Range.from',
  })

  protected rangeTo = new Gauge({
    name: 'hydra_processor_range_to',
    help: 'Range.to',
  })

  init(): void {
    collectDefaultMetrics({ prefix: 'hydra_processor_system_' })

    this.initValues()
      .then(() => {
        eventEmitter.on(
          ProcessorEvents.STATE_CHANGE,
          (state: IProcessorState) => {
            this.lastScannedBlock.set(state.lastScannedBlock)
          }
        )

        eventEmitter.on(
          ProcessorEvents.PROCESSED_EVENT,
          (event: SubstrateEvent) => {
            this.lastProcessedBlock.set(event.blockNumber)
            this.processedEvents.inc()
            this.processedEvents.inc({ name: event.name })
          }
        )

        eventEmitter.on(
          ProcessorEvents.INDEXER_STATUS_CHANGE,
          (indexerStatus: IndexerStatus) => {
            this.chainHeight.set(indexerStatus.chainHeight)
            this.indexerHead.set(indexerStatus.head)
          }
        )

        eventEmitter.on(ProcessorEvents.QUEUE_SIZE_CHANGE, (size) => {
          this.eventQueueSize.set(size)
        })
      })
      .catch((e) => debug(`Error initializing the values: ${logError(e)}`))
  }

  private async initValues(): Promise<void> {
    const totalEvents = await countProcessedEvents(conf().ID)
    this.processedEvents.set(totalEvents)
    this.rangeFrom.set(getManifest().mappings.range.from)
    this.rangeTo.set(getManifest().mappings.range.to)
  }
}
