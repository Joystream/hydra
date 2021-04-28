import { Header, Hash } from '@polkadot/types/interfaces'
import Debug from 'debug'
import { waitFor, withTimeout } from '@dzlzv/hydra-common'

import pRetry from 'p-retry'

import {
  BLOCK_PRODUCER_FETCH_RETRIES,
  NEW_BLOCK_TIMEOUT_MS,
  HEADER_CACHE_CAPACITY,
  FINALITY_THRESHOLD,
} from './indexer-consts'
import { getSubstrateService, ISubstrateService } from '../substrate'
import { QueryEventBlock, fromBlockData } from '../model'
import { IBlockProducer } from './IBlockProducer'
import FIFOCache from './FIFOCache'
import { getConfig } from '..'
import { eventEmitter, IndexerEvents } from '../node/event-emitter'

const DEBUG_TOPIC = 'hydra-indexer:producer'

const debug = Debug(DEBUG_TOPIC)

export class BlockProducer implements IBlockProducer<QueryEventBlock> {
  private _started: boolean

  private _blockToProduceNext: number

  private _chainHeight: number

  private _headerCache = new FIFOCache<number, Header>(HEADER_CACHE_CAPACITY)
  private substrateService!: ISubstrateService

  constructor() {
    this._started = false
    this._blockToProduceNext = 0
    this._chainHeight = 0
  }

  async start(atBlock: number): Promise<void> {
    if (this._started) throw Error(`Cannot start when already started.`)
    this.substrateService = await getSubstrateService()

    // mark as started
    this._started = true

    // Try to get initial header right away
    const finalizedHeadHash = await this.substrateService.getFinalizedHead()
    const header = await this.substrateService.getHeader(finalizedHeadHash)
    this._chainHeight = header.number.toNumber()

    //
    eventEmitter.on(IndexerEvents.NEW_FINALIZED_HEAD, ({ header, height }) => {
      debug(`New finalized head: ${JSON.stringify(header)}, height: ${height}`)
      this._headerCache.put(height, header)
      this._onNewHeads(header)
    })

    this._blockToProduceNext = atBlock
    debug(
      `Starting the block producer, next block: ${this._blockToProduceNext.toString()}`
    )
    if (atBlock > this._chainHeight) {
      debug(
        `Current finalized head ${this._chainHeight} is behind the start block ${atBlock}. Waiting...`
      )
      await waitFor(() => this._chainHeight >= atBlock)
    }
  }

  async stop(): Promise<void> {
    if (!this._started) {
      debug('Block producer is not started')
      return
    }

    debug('Block producer has been stopped')
    this._started = false
  }

  private _onNewHeads(header: Header) {
    this._chainHeight = header.number.toNumber()
    debug(`New block found at height #${this._chainHeight.toString()}`)
  }

  public async fetchBlock(height: number): Promise<QueryEventBlock> {
    if (height > this._chainHeight) {
      throw new Error(
        `Cannot fetch block at height ${height}, current chain height is ${this._chainHeight}`
      )
    }
    debug(`Fetching block #${height.toString()}`)
    const targetHash = await this.getBlockHash(height)
    return pRetry(() => this._doBlockProduce(targetHash), {
      retries: BLOCK_PRODUCER_FETCH_RETRIES,
    }) // retry after 5 seconds
  }

  public async *blockHeights(): AsyncGenerator<number> {
    while (this._started) {
      await this.checkHeightOrWait()
      debug(`Yield: ${this._blockToProduceNext.toString()}`)
      yield this._blockToProduceNext
      this._blockToProduceNext++
    }
  }

  /**
   * This sub-routine does the actual fetching and block processing.
   * It can throw errors which should be handled by the top-level code
   * (in this case _produce_block())
   */
  private async _doBlockProduce(targetHash: Hash): Promise<QueryEventBlock> {
    debug(`\tHash ${targetHash.toString()}.`)

    const blockData = await this.substrateService.getBlockData(targetHash)
    if (getConfig().VERBOSE) {
      debug(`Received block data: ${JSON.stringify(blockData, null, 2)}`)
    }
    debug(`Produced query event block.`)

    return fromBlockData(blockData)
  }

  private async checkHeightOrWait(): Promise<void> {
    return await withTimeout(
      waitFor(
        // when to resolve
        () => this._blockToProduceNext <= this._chainHeight,
        // exit condition
        () => !this._started
      ),
      `Timed out: no block has been produced within last ${NEW_BLOCK_TIMEOUT_MS} seconds`,
      NEW_BLOCK_TIMEOUT_MS
    )
  }

  private async getBlockHash(h: number): Promise<Hash> {
    const cachedHeader = this._headerCache.get(h)

    if (cachedHeader) {
      debug(`Cached header ${cachedHeader.toString()} at height ${h} `)
      return cachedHeader.hash
    }
    // wait for finality threshold to be on the safe side
    const isFinal = () => this._chainHeight - h > FINALITY_THRESHOLD
    if (!isFinal()) {
      debug(
        `Block number: ${h}, current chain height: ${this._chainHeight}. Waiting for the finality threshold: ${FINALITY_THRESHOLD}.`
      )
      await waitFor(isFinal)
    }

    return await this.substrateService.getBlockHash(h.toString())
  }
}
