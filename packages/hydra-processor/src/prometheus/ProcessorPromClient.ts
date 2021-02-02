import { Gauge, collectDefaultMetrics } from 'prom-client'
import { IProcessorState } from '../state'
import { SubstrateEvent, logError } from '@dzlzv/hydra-common'
import Debug from 'debug'
import { countProcessedEvents } from '../db'
import { eventEmitter, PROCESSED_EVENT, STATE_CHANGE } from '../start/events'
import { conf } from '../start/config'

const debug = Debug('index-builder:processor-prom-client')

export class ProcessorPromClient {
  protected lastScannedBlock = new Gauge({
    name: 'hydra_processor_last_scanned_block',
    help: 'Last block the processor has scanned for events',
  })

  protected processedEvents = new Gauge({
    name: 'hydra_processor_processed_events_cnt',
    help: 'total number of processed events',
    labelNames: ['name'],
  })

  init(): void {
    collectDefaultMetrics({ prefix: 'hydra_processor_system_' })

    this.initValues()
      .then(() => {
        eventEmitter.on(STATE_CHANGE, (state: IProcessorState) => {
          this.lastScannedBlock.set(state.lastScannedBlock)
        })

        eventEmitter.on(PROCESSED_EVENT, (event: SubstrateEvent) => {
          this.processedEvents.inc()
          this.processedEvents.inc({ name: event.name })
        })
      })
      .catch((e) => debug(`Error initializing the values: ${logError(e)}`))
  }

  private async initValues(): Promise<void> {
    const totalEvents = await countProcessedEvents(conf.NAME)
    this.processedEvents.set(totalEvents)
  }
}
