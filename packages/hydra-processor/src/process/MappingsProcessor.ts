/* eslint-disable @typescript-eslint/naming-convention */
import { logError } from '@dzlzv/hydra-common'
import Debug from 'debug'

import { IStateKeeper, getStateKeeper } from '../state'

import { conf } from '../start/config'

import { error, info } from '../util/log'
import { EventContext, getEventQueue, IEventQueue } from '../queue'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import pWhilst from 'p-whilst'
import {
  getMappingExecutor,
  IMappingExecutor,
  isTxAware,
  TransactionalExecutor,
} from '../executor'
import { DummyExecutor } from '../executor/DummyExecutor'

const debug = Debug('hydra-processor:mappings-processor')

export class MappingsProcessor {
  private _started = false

  constructor(
    protected mappingsExecutor: IMappingExecutor = new TransactionalExecutor(), //new DummyExecutor(),
    protected stateKeeper: IStateKeeper = getStateKeeper(),
    protected eventsQueue: IEventQueue = getEventQueue()
  ) {}

  async start(): Promise<void> {
    info('Starting the processor')
    this._started = true

    await this.mappingsExecutor.init()
    await this.eventsQueue.init()

    await Promise.all([this.eventsQueue.start(), this.processingLoop()])
  }

  stop(): void {
    this.eventsQueue.stop()
    this._started = false
  }

  get stopped(): boolean {
    return !this._started
  }

  // Long running loop where events are fetched and the mappings are applied
  private async processingLoop(): Promise<void> {
    while (this.shouldWork()) {
      try {
        // if the event queue is empty, there're no events for mappings
        // in the requested blocks, so we simply fast-forward `lastScannedBlock`
        await pWhilst(
          () => this.eventsQueue.isEmpty(),
          () =>
            this.stateKeeper.updateState({
              lastScannedBlock: this.eventsQueue.lastScannedBlock(),
            })
        )

        const eventCtxs = await this.eventsQueue.nextBatch(
          conf.MAPPINGS_BATCH_SIZE
        )

        debug(`Processing new batch of events of size: ${eventCtxs.length}`)

        await this.mappingsExecutor.executeBatch(
          eventCtxs,
          async (ctx: EventContext) => {
            const { event } = ctx

            await this.stateKeeper.updateState(
              { lastProcessedEvent: event.id },
              // update the state in the same transaction if the tx context is present
              isTxAware(ctx) ? ctx.entityManager : undefined
            )
          }
        )
        // emit all at once
        eventCtxs.map((ctx) =>
          eventEmitter.emit(ProcessorEvents.PROCESSED_EVENT, ctx.event)
        )
      } catch (e) {
        error(`Stopping the proccessor due to errors: ${logError(e)}`)
        this.stop()
        throw new Error(e)
      }
    }
    debug(`The processor has stopped`)
  }

  private shouldWork(): boolean {
    return this._started
  }
}
