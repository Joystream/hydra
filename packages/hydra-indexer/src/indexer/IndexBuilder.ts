// @ts-check
import { QueryEventBlock } from '../model'
import * as _ from 'lodash'

import Debug from 'debug'
import { PooledExecutor } from './PooledExecutor'
import { SubstrateEventEntity } from '../entities'
import {
  BLOCK_START_CHANNEL,
  BLOCK_COMPLETE_CHANNEL,
} from '../redis/redis-keys'
import { IStatusService } from '../status-service/IStatusService'
import { WORKERS_NUMBER } from './indexer-consts'
import { toPayload } from '../model/BlockPayload'
import { getConnection, EntityManager } from 'typeorm'
import { getConfig } from '../node'
import { BlockProducer } from '.'
import { getStatusService } from '../status-service'
import { eventEmitter, IndexerEvents } from '../node/event-emitter'

const debug = Debug('hydra-indexer:indexer')

// @Service('IndexBuilder')
export class IndexBuilder {
  private _stopped = false
  private producer!: BlockProducer
  private statusService!: IStatusService
  // public constructor(
  //   @Inject('BlockProducer')
  //   protected readonly producer: IBlockProducer<QueryEventBlock>,
  //   @Inject('StatusService') protected readonly statusService: IStatusService
  // ) {
  //   super()
  // }

  async start(): Promise<void> {
    this.producer = new BlockProducer()
    this.statusService = await getStatusService()

    debug('Spawned worker.')

    const lastHead = await this.statusService.getIndexerHead()

    debug(`Last indexed block in the database: ${lastHead.toString()}`)
    let startBlock = lastHead + 1

    const atBlock = getConfig().BLOCK_HEIGHT

    if (lastHead >= 0 && !getConfig().FORCE_HEIGHT) {
      debug(
        `WARNING! The database contains indexed blocks.
          The last indexed block height is ${lastHead}. The indexer 
          will continue from block ${lastHead} ignoring the start 
          block height hint. Set the environment variable FORCE_BLOCK_HEIGHT to true 
          if you want to start from ${atBlock} anyway.`
      )
    } else {
      startBlock = Math.max(startBlock, atBlock)
    }

    debug(`Starting the block indexer at block ${startBlock}`)

    await this.producer.start(startBlock)

    const poolExecutor = new PooledExecutor(
      WORKERS_NUMBER,
      this.producer.blockHeights(),
      this._indexBlock()
    )

    debug('Started a pool of indexers.')
    eventEmitter.on(IndexerEvents.INDEXER_STOP, async () => await this.stop())

    try {
      await poolExecutor.run(() => this._stopped)
    } finally {
      await this.stop()
    }
  }

  async stop(): Promise<void> {
    debug('Index builder has been stopped')
    this._stopped = true
    await this.producer.stop()
  }

  _indexBlock(): (h: number) => Promise<void> {
    return async (h: number) => {
      debug(`Processing block #${h.toString()}`)

      const done = await this.statusService.isComplete(h)
      if (done) {
        debug(`Block ${h} has already been indexed`)
        return
      }

      eventEmitter.emit(BLOCK_START_CHANNEL, {
        height: h,
      })

      const queryEventsBlock: QueryEventBlock = await this.producer.fetchBlock(
        h
      )

      await this.transformAndPersist(queryEventsBlock)
      debug(`Done block #${h.toString()}`)

      eventEmitter.emit(BLOCK_COMPLETE_CHANNEL, toPayload(queryEventsBlock))
    }
  }

  async transformAndPersist(queryEventsBlock: QueryEventBlock): Promise<void> {
    const batches = _.chunk(queryEventsBlock.queryEvents, 100)
    debug(
      `Read ${queryEventsBlock.queryEvents.length} events; saving in ${batches.length} batches`
    )

    getConnection().transaction(async (em: EntityManager) => {
      debug(`Saving event entities`)

      let saved = 0
      for (let batch of batches) {
        const qeEntities = batch.map((event) =>
          SubstrateEventEntity.fromQueryEvent(event)
        )
        await em.save(qeEntities)
        saved += qeEntities.length
        batch = []
        debug(`Saved ${saved} events`)
      }
    })
  }
}
