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
import { Callback, Codec } from '@polkadot/types/types'
import { ApiPromise } from '@polkadot/api'
import { UnsubscribePromise } from '@polkadot/api/types'
import { retryWithTimeout, logError } from '@dzlzv/hydra-common'
import pForever from 'p-forever'
import delay from 'delay'
import Debug from 'debug'
import pProps from 'p-props'

import { getConfig } from '../'
import { getApiPromise, getBlockTimestamp, ISubstrateService } from '.'

import {
  SUBSTRATE_API_CALL_RETRIES,
  SUBSTRATE_API_TIMEOUT,
} from '../indexer/indexer-consts'

import { Service } from 'typedi'
import BN from 'bn.js'
import { BlockData } from '../model'
import { eventEmitter, Events } from '../node/event-emitter'

const debug = Debug('hydra-indexer:substrate-service')

export class SubstrateService implements ISubstrateService {
  private api!: ApiPromise
  private shouldStop = false

  async init(): Promise<void> {
    this.api = await getApiPromise()

    eventEmitter.on(Events.NODE_STOP, this.stop)

    pForever(async () => {
      if (this.shouldStop) {
        return pForever.end
      }
      try {
        await this.ping()
      } catch (e) {
        console.log(`Ping error: ${JSON.stringify(e)}`)
        await this.api.disconnect()
        this.api = await getApiPromise()
      }
      await delay(getConfig().NODE_PING_INTERVAL)
    })
  }

  async getHeader(hash: Hash | Uint8Array | string): Promise<Header> {
    return this._retryWithBackoff(
      () => this.api.rpc.chain.getHeader(hash),
      `Getting block header of ${JSON.stringify(hash)}`
    )
  }

  getFinalizedHead(): Promise<Hash> {
    return this._retryWithBackoff(
      () => this.api.rpc.chain.getFinalizedHead(),
      `Getting finalized head`
    )
  }

  subscribeFinalizedHeads(v: Callback<Header>): UnsubscribePromise {
    return this.api.rpc.chain.subscribeFinalizedHeads(v)
  }

  async getBlockHash(
    blockNumber?: BlockNumber | Uint8Array | number | string
  ): Promise<Hash> {
    debug(`Fetching block hash. BlockNumber: ${JSON.stringify(blockNumber)}`)
    return this._retryWithBackoff(
      () => this.api.rpc.chain.getBlockHash(blockNumber),
      `Getting block hash of ${JSON.stringify(blockNumber)}`
    )
  }

  async getSignedBlock(hash: Hash | Uint8Array | string): Promise<SignedBlock> {
    debug(`Fething signed block: ${JSON.stringify(hash)}`)
    return this._retryWithBackoff(
      () => this.api.rpc.chain.getBlock(hash),
      `Getting block at ${JSON.stringify(hash)}`
    )
  }

  async eventsAt(
    hash: Hash | Uint8Array | string
  ): Promise<EventRecord[] & Codec> {
    debug(`Fething events. BlockHash:  ${JSON.stringify(hash)}`)
    return this._retryWithBackoff(
      () => this.api.query.system.events.at(hash),
      `Fetching events at ${JSON.stringify(hash)}`
    )
  }

  private async _retryWithBackoff<T>(
    promiseFn: () => Promise<T>,
    functionName: string
  ): Promise<T> {
    try {
      return await retryWithTimeout(
        promiseFn,
        SUBSTRATE_API_TIMEOUT,
        SUBSTRATE_API_CALL_RETRIES
      )
    } catch (e) {
      throw new Error(
        `Substrated API call ${functionName} failed. Error: ${logError(e)}`
      )
    }
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
    const health = await this.api.rpc.system.health()
    debug(`PONG. Node health: ${JSON.stringify(health)}`)
  }

  async metadata(hash: Hash): Promise<MetadataLatest> {
    const metadata = await this.api.rpc.state.getMetadata(hash)
    return metadata.asLatest
  }

  async runtimeVersion(hash: Hash): Promise<RuntimeVersion> {
    return this.api.rpc.state.getRuntimeVersion(hash)
  }

  async timestamp(hash: Hash): Promise<BN> {
    return this.api.query.timestamp.now.at(hash)
  }

  async lastRuntimeUpgrade(
    hash: Hash
  ): Promise<LastRuntimeUpgradeInfo | undefined> {
    const info = await this.api.query.system.lastRuntimeUpgrade.at(hash)
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
