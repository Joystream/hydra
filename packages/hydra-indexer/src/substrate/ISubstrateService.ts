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
import { UnsubscribePromise } from '@polkadot/api/types'
import BN from 'bn.js'
import { BlockData } from '../model'

/**
 * @description ...
 */
export interface ISubstrateService {
  getFinalizedHead(): Promise<Hash>
  getHeader(hash?: Hash | Uint8Array | string): Promise<Header>
  subscribeFinalizedHeads(v: Callback<Header>): UnsubscribePromise
  getBlockHash(
    blockNumber?: BlockNumber | Uint8Array | number | string
  ): Promise<Hash>
  getSignedBlock(hash?: Hash | Uint8Array | string): Promise<SignedBlock>
  // Cut down from at: (hash: Hash | Uint8Array | string, ...args: Parameters<F>) => PromiseOrObs<ApiType, ObsInnerType<ReturnType<F>>>;
  eventsAt(hash: Hash | Uint8Array | string): Promise<EventRecord[] & Codec>
  // eventsRange()
  // events()

  metadata(hash: Hash): Promise<MetadataLatest>
  lastRuntimeUpgrade(hash: Hash): Promise<LastRuntimeUpgradeInfo | undefined>
  runtimeVersion(hash: Hash): Promise<RuntimeVersion>
  timestamp(hash: Hash): Promise<BN>

  getBlockData(hash: Hash): Promise<BlockData>
  /**
   * calls the rpc endpoint to make sure it's alive
   */
  ping(): Promise<void>
  stop(): Promise<void>
}

// export function makeSubstrateService(api: ApiPromise): ISubstrateService {
//   return new SubstrateService(api)
// }
