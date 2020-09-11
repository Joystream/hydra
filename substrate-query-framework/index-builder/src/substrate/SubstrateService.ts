import { Hash, Header, BlockNumber, EventRecord, SignedBlock } from '@polkadot/types/interfaces';
import { Callback, Codec } from '@polkadot/types/types';
import { u32 } from '@polkadot/types/primitive';
import { ApiPromise } from '@polkadot/api';

import { ISubstrateService } from '.';
import { UnsubscribePromise } from '@polkadot/api/types';
import Debug from 'debug';
import { numberEnv } from '../utils/env-flags';
import { retryWithTimeout } from '../utils/wait-for';
import { logError } from '../utils/errors';

const debug = Debug('index-builder:producer');

const SUBSTRATE_API_TIMEOUT = numberEnv('SUBSTRATE_API_TIMEOUT') || 1000 * 60 * 5;
const SUBSTRATE_API_CALL_RETRIES = numberEnv('SUBSTRATE_API_CALL_RETRIES') || 20;


export class SubstrateService implements ISubstrateService {
  // Enough large number
  private readonly _versionReset = 99999999;

  private _api: ApiPromise;

  // Store runtime spec version
  private _specVersion: u32;

  constructor(api: ApiPromise) {
    this._api = api;
    this._specVersion = api.createType('u32', this._versionReset);
  }

  async getHeader(hash: Hash | Uint8Array | string): Promise<Header> {
    return this._retryWithBackoff(this._api.rpc.chain.getHeader(hash), `Getting block header of ${JSON.stringify(hash)}`);
  }

  getFinalizedHead(): Promise<Hash> {
    return this._retryWithBackoff(this._api.rpc.chain.getFinalizedHead(), `Getting finalized head`);
  }

  subscribeNewHeads(v: Callback<Header>): UnsubscribePromise {
    return this._retryWithBackoff(this._api.rpc.chain.subscribeNewHeads(v), `Subscribing to new heads`);
  }

  async getBlockHash(blockNumber?: BlockNumber | Uint8Array | number | string): Promise<Hash> {
    debug(`Fetching block hash: BlockNumber: ${JSON.stringify(blockNumber)}`)
    return this._retryWithBackoff(this._api.rpc.chain.getBlockHash(blockNumber), `Getting block hash of ${JSON.stringify(blockNumber)}`);
  }

  async getBlock(hash: Hash | Uint8Array | string): Promise<SignedBlock> {
    debug(`Fething block: BlockHash: ${JSON.stringify(hash)}`)
    return this._retryWithBackoff(this._api.rpc.chain.getBlock(hash), `Getting block at ${JSON.stringify(hash)}`);
  }

  async eventsAt(hash: Hash | Uint8Array | string): Promise<EventRecord[] & Codec> {
    debug(`Fething events. BlockHash:  ${JSON.stringify(hash)}`)
    return this._retryWithBackoff(this._api.query.system.events.at(hash), `Fetching events at ${JSON.stringify(hash)}`);
  }

  private async _retryWithBackoff<T>(promiseFn: Promise<T>, functionName: string): Promise<T> {
    try {
      return await retryWithTimeout(promiseFn, SUBSTRATE_API_TIMEOUT, SUBSTRATE_API_CALL_RETRIES);
    } catch (e) {
      throw new Error(`Substrated API call ${functionName} failed. Error: ${logError(e)}`); 
    }
  }
}
