import {
  Hash,
  Header,
  AccountId,
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
import { getApiPromise, getBlockTimestamp, ISubstrateService } from '.'

// import pTimeout from 'p-timeout'
import pRetry from 'p-retry'

import BN from 'bn.js'
import { BlockData } from '../model'
import { eventEmitter, IndexerEvents } from '../node/event-emitter'
import { ApiDecoration } from '@polkadot/api/types'
import { prometheus } from '../node'
import { Histogram } from 'prom-client'

const debug = Debug('hydra-indexer:substrate-service')

export class SubstrateService implements ISubstrateService {
  private shouldStop = false
  // prometheus gauge for metering execution
  private timingHist: Histogram<'method' | 'status'> =
    prometheus.gRPCRequestHistogram()

  async init(): Promise<void> {
    debug(`Initializing SubstrateService`)
    await getApiPromise()
    await this.subscribeToHeads()

    eventEmitter.on(IndexerEvents.INDEXER_STOP, async () => await this.stop())
    // eventEmitter.on(
    //   IndexerEvents.API_CONNECTED,
    //   async () => await this.subscribeToHeads()
    // )

    pForever(async () => {
      if (this.shouldStop) {
        return pForever.end
      }
      await this.ping()
      await delay(getConfig().NODE_PING_INTERVAL)
    })
  }

  async getHeader(hash: Hash | Uint8Array | string): Promise<Header> {
    return this.apiCall((api) => api.rpc.chain.getHeader(hash), `get_header`)
  }

  getFinalizedHead(): Promise<Hash> {
    return this.apiCall(
      (api) => api.rpc.chain.getFinalizedHead(),
      `get_finalized_head`
    )
  }

  async subscribeToHeads(): Promise<void> {
    debug(`Subscribing to new heads`)
    const api = await getApiPromise()
    api.rx.rpc.chain.subscribeFinalizedHeads().subscribe({
      next: (header: Header) =>
        eventEmitter.emit(IndexerEvents.NEW_FINALIZED_HEAD, {
          header,
          height: header.number.toNumber(),
        }),
    })

    api.rx.rpc.chain.subscribeNewHeads().subscribe({
      next: (header: Header) =>
        eventEmitter.emit(IndexerEvents.NEW_BEST_HEAD, {
          header,
          height: header.number.toNumber(),
        }),
    })

    api.rx.rpc.chain.subscribeAllHeads().subscribe({
      next: (header: Header) =>
        eventEmitter.emit(IndexerEvents.NEW_HEAD, {
          header,
          height: header.number.toNumber(),
        }),
    })
  }

  // async subscribeFinalizedHeads(v: Callback<Header>): UnsubscribePromise {
  //   const api = await getApiPromise()
  //   api.rpc.chain.subscribeFinalizedHeads()
  //   return (await getApiPromise()).rpc.chain.subscribeFinalizedHeads(v)
  // }

  async getBlockHash(
    blockNumber?: BlockNumber | Uint8Array | number | string
  ): Promise<Hash> {
    debug(`Fetching block hash. BlockNumber: ${JSON.stringify(blockNumber)}`)
    return this.apiCall(
      (api) => api.rpc.chain.getBlockHash(blockNumber),
      `get_block_hash`
    )
  }

  async getSignedBlock(hash: Hash | Uint8Array | string): Promise<SignedBlock> {
    debug(`Fething signed block: ${JSON.stringify(hash)}`)
    return this.apiCall(
      (api) => api.rpc.chain.getBlock(hash),
      `get_signed_block`
    )
  }

  async eventsAt(
    hash: Hash | Uint8Array | string
  ): Promise<EventRecord[] & Codec> {
    debug(`Fething events. BlockHash:  ${JSON.stringify(hash)}`)
    const end = this.timingHist.startTimer({ method: 'system_events' })

    try {
      const apiAt = await this.apiAt(hash)
      const result = await apiAt.query.system.events()
      end({ status: '200' })
      return result
    } catch (e) {
      end({ status: '500' })
      throw e
    }
  }

  private async apiAt(
    hash: Hash | Uint8Array | string
  ): Promise<ApiDecoration<'promise'>> {
    return await this.apiCall((api) => api.at(hash), 'hash')
  }

  private async apiCall<T>(
    promiseFn: (api: ApiPromise) => Promise<T>,
    functionName = 'api_request'
  ): Promise<T> {
    let end: any = null

    return pRetry(
      async () => {
        if (this.shouldStop) {
          throw new pRetry.AbortError(
            'The indexer is stopping, aborting all API calls'
          )
        }

        end = this.timingHist.startTimer({ method: functionName })

        const api = await getApiPromise()
        const result = await promiseFn(api)

        end({ status: '200' })
        end = null
        return result
      },
      {
        retries: getConfig().SUBSTRATE_API_CALL_RETRIES,
        onFailedAttempt: () => {
          if (end) {
            end({ status: '500' })
            end = null
          }
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
      validatorId: this.validatorId(hash),
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
    const health = await this.apiCall((api) => api.rpc.system.health(), 'ping')
    debug(`PONG. Node health: ${JSON.stringify(health)}`)
  }

  async metadata(hash: Hash): Promise<MetadataLatest> {
    const metadata = await this.apiCall(
      (api) => api.rpc.state.getMetadata(hash),
      'get_metadata'
    )
    return metadata.asLatest
  }

  async runtimeVersion(hash: Hash): Promise<RuntimeVersion> {
    return this.apiCall(
      (api) => api.rpc.state.getRuntimeVersion(hash),
      'get_runtime_version'
    )
  }

  async timestamp(hash: Hash): Promise<BN> {
    const apiAt = await this.apiAt(hash)

    const end = this.timingHist.startTimer({ method: 'timestamp' })
    try {
      const result = await apiAt.query.timestamp.now()
      end({ status: '200' })
      return result
    } catch (e) {
      end({ status: '500' })
      throw e
    }
  }

  async validatorId(hash: Hash): Promise<AccountId | undefined> {
    const headerExtended = await this.apiCall(
      (api) => api.derive.chain.getHeader(hash),
      'get_header'
    )
    return headerExtended?.author
  }

  async lastRuntimeUpgrade(
    hash: Hash
  ): Promise<LastRuntimeUpgradeInfo | undefined> {
    const apiAt = await this.apiAt(hash)

    const end = this.timingHist.startTimer({ method: 'last_runtime_upgrade' })
    try {
      const info = await apiAt.query.system.lastRuntimeUpgrade?.()
      end({ status: '200' })
      return info?.unwrapOr(undefined)
    } catch (e) {
      end({ status: '500' })
      throw e
    }
  }

  async stop(): Promise<void> {
    debug(`Stopping substrate service`)
    this.shouldStop = true
    const api = await getApiPromise()
    if (api.isConnected) {
      await api.disconnect()
      debug(`Api disconnected`)
    }
    debug(`Done`)
  }
}
