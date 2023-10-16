import '@polkadot/api-augment/substrate'

import {
  Hash,
  Header,
  BlockNumber,
  EventRecord,
  SignedBlock,
  MetadataLatest,
  RuntimeVersion,
  LastRuntimeUpgradeInfo,
} from '@polkadot/types/interfaces'
import { Codec } from '@polkadot/types/types'
import { ApiPromise } from '@polkadot/api'
import pForever from 'p-forever'
import delay from 'delay'
import Debug from 'debug'
import pProps from 'p-props'

import { getConfig } from '../'
import { createApiPromise, getBlockTimestamp, ISubstrateService } from '.'

import pRetry from 'p-retry'

import BN from 'bn.js'
import { BlockData } from '../model'
import { eventEmitter, IndexerEvents } from '../node/event-emitter'
import { Subscription } from 'rxjs'

const debug = Debug('hydra-indexer:substrate-service')

export class SubstrateService implements ISubstrateService {
  private shouldStop = false
  private api: ApiPromise | undefined

  async init(): Promise<void> {
    debug(`Initializing SubstrateService`)
    await this.connect()

    eventEmitter.on(IndexerEvents.INDEXER_STOP, async () => await this.stop())

    pForever(async () => {
      if (this.shouldStop) {
        return pForever.end
      }
      await this.ping()
      await delay(getConfig().NODE_PING_INTERVAL)
    })
  }

  private async connect() {
    this.api = await createApiPromise()

    const subscriptions = this.subscribeToHeads(this.api)

    this.api
      .once('disconnected', () => {
        debug('Api disconnected')
      })
      .on('error', async (e) => {
        debug(`Api error: ${JSON.stringify(e)}`)
      })
      .once('decorated', async () => {
        debug('Api decorated')
        subscriptions.forEach((sub) => sub.unsubscribe())
        const oldApi = this.api
        await this.connect()
        // allow short time for running queries to complete
        await delay(1000)
        try {
          oldApi?.isConnected && (await oldApi?.disconnect())
        } catch (err) {
          debug(`Error trying to disconnection Api ${err}`)
        }
      })
  }

  async getHeader(hash: Hash | Uint8Array | string): Promise<Header> {
    return this.apiCall(
      (api) => api.rpc.chain.getHeader(hash),
      `Getting block header of ${JSON.stringify(hash)}`
    )
  }

  getFinalizedHead(): Promise<Hash> {
    return this.apiCall(
      (api) => api.rpc.chain.getFinalizedHead(),
      `Getting finalized head`
    )
  }

  subscribeToHeads(api: ApiPromise): Subscription[] {
    debug(`Subscribing to new heads`)
    return [
      api.rx.rpc.chain.subscribeFinalizedHeads().subscribe({
        next: (header: Header) =>
          eventEmitter.emit(IndexerEvents.NEW_FINALIZED_HEAD, {
            header,
            height: header.number.toNumber(),
          }),
      }),

      api.rx.rpc.chain.subscribeNewHeads().subscribe({
        next: (header: Header) =>
          eventEmitter.emit(IndexerEvents.NEW_BEST_HEAD, {
            header,
            height: header.number.toNumber(),
          }),
      }),

      api.rx.rpc.chain.subscribeAllHeads().subscribe({
        next: (header: Header) =>
          eventEmitter.emit(IndexerEvents.NEW_HEAD, {
            header,
            height: header.number.toNumber(),
          }),
      }),
    ]
  }

  async getBlockHash(
    blockNumber?: BlockNumber | Uint8Array | number | string
  ): Promise<Hash> {
    debug(`Fetching block hash. BlockNumber: ${JSON.stringify(blockNumber)}`)
    return this.apiCall(
      (api) => api.rpc.chain.getBlockHash(blockNumber),
      `get block hash by height ${JSON.stringify(blockNumber)}`
    )
  }

  async getSignedBlock(hash: Hash | Uint8Array | string): Promise<SignedBlock> {
    debug(`Fething signed block: ${JSON.stringify(hash)}`)
    return this.apiCall(
      (api) => api.rpc.chain.getBlock(hash),
      `get signed block by hash ${JSON.stringify(hash)}`
    )
  }

  async eventsAt(
    hash: Hash | Uint8Array | string
  ): Promise<EventRecord[] & Codec> {
    debug(`Fething events. BlockHash:  ${JSON.stringify(hash)}`)
    return this.apiCall(
      (api) => api.query.system.events.at(hash),
      `get block events of block ${JSON.stringify(hash)}`
    )
  }

  private async apiCall<T>(
    promiseFn: (api: ApiPromise) => Promise<T>,
    functionName = 'api request'
  ): Promise<T> {
    return pRetry(
      async () => {
        if (this.shouldStop) {
          throw new pRetry.AbortError(
            'The indexer is stopping, aborting all API calls'
          )
        }
        if (!this.api || !this.api.isConnected) {
          throw Error(`Api connection not ready`)
        }
        return promiseFn(this.api)
      },
      {
        retries: getConfig().SUBSTRATE_API_CALL_RETRIES,
        onFailedAttempt: async (i) => {
          debug(
            `Failed to execute "${functionName}" after ${i.attemptNumber} attempts. Retries left: ${i.retriesLeft}`
          )
          await delay(200)
        },
      }
    )
  }

  async getBlockData(hash: Hash): Promise<BlockData> {
    const data = {
      events: this.eventsAt(hash),
      signedBlock: this.getSignedBlock(hash),
      lastUpgrade: this.lastRuntimeUpgrade(hash),
      runtimeVersion: this.runtimeVersion(hash),
    }
    const out = (await pProps(data)) as Partial<BlockData>
    if (getConfig().VERBOSE) debug(`Out: ${JSON.stringify(out, null, 2)}`)
    out.timestamp = getBlockTimestamp(
      (out.signedBlock as SignedBlock).block.extrinsics.toArray()
    )
    return out as BlockData
  }

  async ping(): Promise<void> {
    debug(`PING`)
    const health = await this.apiCall((api) => api.rpc.system.health())
    debug(`PONG. Node health: ${JSON.stringify(health)}`)
  }

  async metadata(hash: Hash): Promise<MetadataLatest> {
    const metadata = await this.apiCall(
      (api) => api.rpc.state.getMetadata(hash),
      'get metadata'
    )
    return metadata.asLatest
  }

  async runtimeVersion(hash: Hash): Promise<RuntimeVersion> {
    return this.apiCall(
      (api) => api.rpc.state.getRuntimeVersion(hash),
      'get runtime version'
    )
  }

  async timestamp(hash: Hash): Promise<BN> {
    return this.apiCall(
      (api) => api.query.timestamp.now.at(hash),
      'get timestamp'
    )
  }

  async lastRuntimeUpgrade(
    hash: Hash
  ): Promise<LastRuntimeUpgradeInfo | undefined> {
    const info = await this.apiCall(
      (api) => api.query.system.lastRuntimeUpgrade.at(hash),
      'get last runtime upgrade'
    )
    return info.unwrapOr(undefined)
  }

  async stop(): Promise<void> {
    debug(`Stopping substrate service`)
    this.shouldStop = true
    if (this.api && this.api.isConnected) {
      await this.api.disconnect()
      debug(`Api disconnected`)
    }
    debug(`Done`)
  }
}
