import { Gauge, Counter, collectDefaultMetrics } from 'prom-client'
import Container from 'typedi'
import { QueryEvent, SubstrateEvent } from '../model'
import { MappingsProcessor } from '../processor'
import {
  IProcessorState,
  IProcessorStateHandler,
} from '../processor/ProcessorStateHandler'
import { logError } from '../utils/errors'
import Debug from 'debug'
import { countProcessedEvents } from '../db'

const debug = Debug('index-builder:processor-prom-client')

export class ProcessorPromClient {
  protected stateHandler: IProcessorStateHandler
  protected processor: MappingsProcessor

  protected lastScannedBlock = new Gauge({
    name: 'hydra_processor_last_scanned_block',
    help: 'Last block the processor has scanned for events',
  })

  protected processedEvents = new Gauge({
    name: 'hydra_processor_processed_events_cnt',
    help: 'total number of processed events',
    labelNames: ['name'],
  })

  constructor() {
    collectDefaultMetrics({ prefix: 'hydra_processor_system_' })
    this.stateHandler = Container.get<IProcessorStateHandler>(
      'ProcessorStateHandler'
    )

    this.processor = Container.get<MappingsProcessor>('MappingsProcessor')

    this.initValues()
      .then(() => {
        this.stateHandler.on('STATE_CHANGE', (state: IProcessorState) => {
          this.lastScannedBlock.set(state.lastScannedBlock)
        })

        this.processor.on('PROCESSED_EVENT', (event: SubstrateEvent) => {
          this.processedEvents.inc()
          this.processedEvents.inc({ name: event.name })
        })
      })
      .catch((e) => debug(`Error initializing the values: ${logError(e)}`))
  }

  private async initValues(): Promise<void> {
    const totalEvents = await countProcessedEvents(this.processor.name)
    this.processedEvents.set(totalEvents)
  }
}
