import { Gauge, Counter, collectDefaultMetrics } from 'prom-client'
import Container from 'typedi'
import { QueryEvent } from '../model'
import { MappingsProcessor } from '../processor'
import {
  IProcessorState,
  IProcessorStateHandler,
} from '../processor/ProcessorStateHandler'

export class ProcessorPromClient {
  protected stateHandler: IProcessorStateHandler
  protected processor: MappingsProcessor

  protected lastScannedBlock = new Gauge({
    name: 'hydra_processor_last_scanned_block',
    help: 'Last block the processor has scanned for events',
  })

  protected processedEvents = new Counter({
    name: 'hydra_processor_processed_events_cnt',
    help: 'total number of processed events',
  })

  constructor() {
    collectDefaultMetrics({ prefix: 'hydra_processor_system_' })
    this.stateHandler = Container.get<IProcessorStateHandler>(
      'ProcessorStateHandler'
    )

    this.processor = Container.get<MappingsProcessor>('MappingsProcessor')

    this.stateHandler.on('STATE_CHANGE', (state: IProcessorState) => {
      this.lastScannedBlock.set(state.lastScannedBlock)
    })

    this.processor.on('PROCESSED_EVENT', (event: QueryEvent) => {
      this.processedEvents.inc()
    })
  }
}
