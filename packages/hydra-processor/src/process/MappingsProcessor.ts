/* eslint-disable @typescript-eslint/naming-convention */
import { logError } from '@joystream/hydra-common'
import Debug from 'debug'

import { IStateKeeper, getStateKeeper } from '../state'
import { error, info } from '../util/log'
import { BlockData, getBlockQueue, IBlockQueue } from '../queue'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import { getMappingExecutor, IMappingExecutor, isTxAware } from '../executor'
import { getManifest } from '../start/config'
const debug = Debug('hydra-processor:mappings-processor')

/**
 * Main class responsible for passing the data to the mapping executor
 */
export class MappingsProcessor {
  private _started = false
  private blockQueue!: IBlockQueue
  private stateKeeper!: IStateKeeper
  private mappingsExecutor!: IMappingExecutor

  async start(): Promise<void> {
    info('Starting the processor')
    this._started = true

    this.mappingsExecutor = await getMappingExecutor()
    this.blockQueue = await getBlockQueue()
    this.stateKeeper = await getStateKeeper()

    await Promise.all([this.blockQueue.start(), this.processingLoop()])
  }

  stop(): void {
    this.blockQueue.stop()
    this._started = false
  }

  get stopped(): boolean {
    return !this._started
  }

  /**
   * Long running loop where the event and block data is retrieved from
   * the blockQueue, and passed to the mapping executor in the right order
   */
  private async processingLoop(): Promise<void> {
    while (this.shouldWork()) {
      try {
        // if the event queue is empty, there're no events for mappings
        // in the requested blocks, so we simply fast-forward `lastScannedBlock`
        debug('awaiting')

        const next = await this.blockQueue.blocksWithEvents().next()

        // range of heights where there might be blocks with hooks
        const hookLookupRange = {
          from: this.stateKeeper.getState().lastScannedBlock + 1,
          to: next.done
            ? getManifest().mappings.range.to
            : next.value.block.height - 1,
        }

        // process blocks with hooks that preceed the event block
        for await (const b of this.blockQueue.blocksWithHooks(
          hookLookupRange
        )) {
          await this.processBlock(b)
        }

        // now process the block with events
        if (next.done === true) {
          info('All the blocks from the queue have been processed')
          break
        }

        const eventBlock = next.value

        await this.processBlock(eventBlock)
      } catch (e) {
        error(`Stopping the proccessor due to errors: ${logError(e)}`)
        this.stop()
        throw new Error(e)
      }
    }
    info(`Terminating the processor`)
  }

  /**
   * Here we do the actual processing by forwarding the block data to the Mapping Executor
   *
   * @param nextBlock - a block data to process
   */
  private async processBlock(nextBlock: BlockData) {
    info(
      `Processing block: ${nextBlock.block.id}, events count: ${nextBlock.events.length} `
    )

    await this.mappingsExecutor.executeBlock(
      nextBlock,
      async (ctx: BlockData) => {
        await this.stateKeeper.updateState(
          { lastScannedBlock: ctx.block.height },
          // update the state in the same transaction if the tx context is present
          isTxAware(ctx) ? ctx.entityManager : undefined
        )
      }
    )
    // emit all at once
    nextBlock.events.map((ctx) =>
      eventEmitter.emit(ProcessorEvents.PROCESSED_EVENT, ctx.event)
    )

    debug(`Done block ${nextBlock.block.height}`)
  }

  private shouldWork(): boolean {
    return this._started
  }
}
