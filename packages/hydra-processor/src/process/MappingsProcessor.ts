/* eslint-disable @typescript-eslint/naming-convention */
import { logError } from '@dzlzv/hydra-common'
import Debug from 'debug'

import { IStateKeeper, getStateKeeper } from '../state'
import { error, info } from '../util/log'
import { BlockContext, getEventQueue, IEventQueue } from '../queue'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import { getMappingExecutor, IMappingExecutor, isTxAware } from '../executor'

const debug = Debug('hydra-processor:mappings-processor')

export class MappingsProcessor {
  private _started = false
  private eventQueue!: IEventQueue
  private stateKeeper!: IStateKeeper
  private mappingsExecutor!: IMappingExecutor

  async start(): Promise<void> {
    info('Starting the processor')
    this._started = true

    this.mappingsExecutor = await getMappingExecutor()
    this.eventQueue = await getEventQueue()
    this.stateKeeper = await getStateKeeper()

    await Promise.all([this.eventQueue.start(), this.processingLoop()])
  }

  stop(): void {
    this.eventQueue.stop()
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
        debug('awaiting')

        const next = await this.eventQueue.blocks().next()

        if (next.done === true) {
          info('All the blocks from the queue have been processed')
          break
        }

        const nextBlock = next.value

        debug(
          `Next block: ${nextBlock.blockNumber}, events count: ${nextBlock.eventCtxs.length} `
        )

        await this.mappingsExecutor.executeBlock(
          nextBlock,
          async (ctx: BlockContext) => {
            await this.stateKeeper.updateState(
              { lastScannedBlock: ctx.blockNumber },
              // update the state in the same transaction if the tx context is present
              isTxAware(ctx) ? ctx.entityManager : undefined
            )
          }
        )
        // emit all at once
        nextBlock.eventCtxs.map((ctx) =>
          eventEmitter.emit(ProcessorEvents.PROCESSED_EVENT, ctx.event)
        )
        debug(`Done block ${nextBlock.blockNumber}`)
      } catch (e) {
        error(`Stopping the proccessor due to errors: ${logError(e)}`)
        this.stop()
        throw new Error(e)
      }
    }
    info(`Terminating the processor`)
  }

  private shouldWork(): boolean {
    return this._started
  }
}
