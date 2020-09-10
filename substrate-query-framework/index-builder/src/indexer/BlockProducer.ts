import { ISubstrateService } from '../substrate';
import { QueryEvent, QueryEventBlock } from '../model';
import { Header, Extrinsic } from '@polkadot/types/interfaces';
import { EventEmitter } from 'events';
import * as assert from 'assert';

import Debug from 'debug';
import { UnsubscribePromise } from '@polkadot/api/types';
import { waitFor, retry } from '../utils/wait-for';
import { numberEnv } from '../utils/env-flags';


const DEBUG_TOPIC = 'index-builder:producer';

// by default, retry infinite number of times
const BLOCK_PRODUCER_FETCH_RETRIES = numberEnv('BLOCK_PRODUCER_FETCH_RETRIES') || -1;

const debug = Debug(DEBUG_TOPIC);

export class BlockProducer extends EventEmitter {
  private _started: boolean;

  private readonly _substrateService: ISubstrateService;

  private _newHeadsUnsubscriber: UnsubscribePromise | undefined;

  private _blockToProduceNext: number;

  private _chainHeight: number;

  constructor(substrateService: ISubstrateService) {
    super();

    this._started = false;
    this._substrateService = substrateService;

    // TODO
    // need to set this up, when state is better, it
    // will be refactored
    this._newHeadsUnsubscriber = undefined;

    this._blockToProduceNext = 0;
    this._chainHeight = 0;
  }

  async start(atBlock?: number): Promise<void> {
    if (this._started) throw Error(`Cannot start when already started.`);

    // mark as started
    this._started = true;

    // Try to get initial header right away
    const finalizedHeadHash = await this._substrateService.getFinalizedHead();
    const header = await this._substrateService.getHeader(finalizedHeadHash);
    this._chainHeight = header.number.toNumber();

    if (atBlock) {
      this._blockToProduceNext = atBlock;
      
      if (atBlock > this._chainHeight) throw Error(`Provided block is ahead of chain.`);
    }

    //
    this._newHeadsUnsubscriber = this._substrateService.subscribeNewHeads((header) => {
      this._OnNewHeads(header);
    });

    debug(`Starting the block producer, next block: ${this._blockToProduceNext.toString()}`);
  }

  async stop(): Promise<void> {
    if (!this._started) throw new Error(`Cannot stop when not already started.`);

    // THIS IS VERY CRUDE, NEED TO MANAGE LOTS OF STUFF HERE!
    if (this._newHeadsUnsubscriber) {
      (await this._newHeadsUnsubscriber)();
    }
    
    this._started = false;
  }

  private _OnNewHeads(header: Header) {
    assert(this._started, 'Has to be started to process new heads.');

    this._chainHeight = header.number.toNumber();

    debug(`New block found at height #${this._chainHeight.toString()}`);

  }


  public async fetchBlock(height: number): Promise<QueryEventBlock> {
    return retry(this._doBlockProduce(height), BLOCK_PRODUCER_FETCH_RETRIES);
  }


  /**
   * This sub-routine does the actual fetching and block processing.
   * It can throw errors which should be handled by the top-level code 
   * (in this case _produce_block())
   */
  private async _doBlockProduce(height: number): Promise<QueryEventBlock> {
    debug(`Fetching block #${height.toString()}`);

    const targetHash = await this._substrateService.getBlockHash(height.toString());
    debug(`\tHash ${targetHash.toString()}.`);

    const records = await this._substrateService.eventsAt(targetHash);
    
    debug(`\tRead ${records.length} events.`);

    let blockExtrinsics: Extrinsic[] = [];
    const signedBlock = await this._substrateService.getBlock(targetHash);

    debug(`\tFetched full block.`);

    blockExtrinsics = signedBlock.block.extrinsics.toArray();
    const blockEvents: QueryEvent[] = records.map(
      (record, index): QueryEvent => {
          // Extract the phase, event
        const { phase } = record;

          // Try to recover extrinsic: only possible if its right phase, and extrinsics arra is non-empty, the last constraint
          // is needed to avoid events from build config code in genesis, and possibly other cases.
        const extrinsic =
          phase.isApplyExtrinsic && blockExtrinsics.length
            ? blockExtrinsics[Number.parseInt(phase.asApplyExtrinsic.toString())]
              : undefined;

        const event = new QueryEvent(record, height, index, extrinsic);

        // Reduce log verbosity and log only if a flag is set
        if (process.env.LOG_QUERY_EVENTS) {
          event.log(0, debug);
        }
        
        return event;
      }
    );

    const eventBlock = new QueryEventBlock(height, blockEvents);
    //this.emit('QueryEventBlock', query_block);
    debug(`Produced query event block.`);
    return eventBlock;
  }


  private async checkHeightOrWait(): Promise<void> {
    return await waitFor(
      // when to resolve
      () => this._blockToProduceNext <= this._chainHeight,
      //exit condition
      () => !this._started )
    
  }

  public async * blockHeights(): AsyncGenerator<number> {
    while (this._started) {
      await this.checkHeightOrWait();
      debug(`Yield: ${this._blockToProduceNext.toString()}`);
      yield this._blockToProduceNext;
      this._blockToProduceNext++;
    }
  }

  
}
