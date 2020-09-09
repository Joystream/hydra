import ISubstrateService from '../substrate/ISubstrateService';
import QueryEvent from '../QueryEvent';
import QueryEventBlock from '../QueryEventBlock';
import { Header, Extrinsic } from '@polkadot/types/interfaces';
import { EventEmitter } from 'events';
import * as assert from 'assert';

import Debug from 'debug';
import { UnsubscribePromise } from '@polkadot/api/types';
import { waitFor, retry } from '../utils/wait-for';


const DEBUG_TOPIC = 'index-builder:producer';


const debug = Debug(DEBUG_TOPIC);

export default class QueryBlockProducer extends EventEmitter {
  private _started: boolean;

  private readonly _query_service: ISubstrateService;

  private _new_heads_unsubscriber: UnsubscribePromise | undefined;

  private _block_to_be_produced_next: number;

  private _height_of_chain: number;

  constructor(query_service: ISubstrateService) {
    super();

    this._started = false;
    this._query_service = query_service;

    // TODO
    // need to set this up, when state is better, it
    // will be refactored
    this._new_heads_unsubscriber = undefined;

    this._block_to_be_produced_next = 0;
    this._height_of_chain = 0;
  }

  // TODO: We cannot assume first block has events... we need more robust logic.
  async start(at_block?: number): Promise<void> {
    if (this._started) throw Error(`Cannot start when already started.`);

    // mark as started
    this._started = true;

    // Try to get initial header right away
    const finalizedHeadHash = await this._query_service.getFinalizedHead();
    const header = await this._query_service.getHeader(finalizedHeadHash);
    this._height_of_chain = header.number.toNumber();

    if (at_block) {
      this._block_to_be_produced_next = at_block;
      
      if (at_block > this._height_of_chain) throw Error(`Provided block is ahead of chain.`);
    }

    //
    this._new_heads_unsubscriber = this._query_service.subscribeNewHeads((header) => {
      this._OnNewHeads(header);
    });

    debug(`Starting the block producer, next block: ${this._block_to_be_produced_next.toString()}`);
  }

  async stop(): Promise<void> {
    if (!this._started) throw new Error(`Cannot stop when not already started.`);

    // THIS IS VERY CRUDE, NEED TO MANAGE LOTS OF STUFF HERE!
    if (this._new_heads_unsubscriber) {
      (await this._new_heads_unsubscriber)();
    }
    
    this._started = false;
  }

  private _OnNewHeads(header: Header) {
    assert(this._started, 'Has to be started to process new heads.');

    this._height_of_chain = header.number.toNumber();

    debug(`New block found at height #${this._height_of_chain.toString()}`);

  }


  public async fetchBlock(height: number = this._block_to_be_produced_next): Promise<QueryEventBlock> {
    return retry(this._doBlockProduce(height));
  }


  /**
   * This sub-routing does the actual fetching and block processing.
   * It can throw errors which should be handled by the top-level code 
   * (in this case _produce_block())
   */
  private async _doBlockProduce(height: number = this._block_to_be_produced_next): Promise<QueryEventBlock> {
    debug(`Fetching block #${height.toString()}`);

    const block_hash_of_target = await this._query_service.getBlockHash(height.toString());
    debug(`\tHash ${block_hash_of_target.toString()}.`);

    const records = await this._query_service.eventsAt(block_hash_of_target);
    
    debug(`\tRead ${records.length} events.`);

    let extrinsics_array: Extrinsic[] = [];
    const signed_block = await this._query_service.getBlock(block_hash_of_target);

    debug(`\tFetched full block.`);

    extrinsics_array = signed_block.block.extrinsics.toArray();
    const query_events: QueryEvent[] = records.map(
      (record, index): QueryEvent => {
          // Extract the phase, event
        const { phase } = record;

          // Try to recover extrinsic: only possible if its right phase, and extrinsics arra is non-empty, the last constraint
          // is needed to avoid events from build config code in genesis, and possibly other cases.
        const extrinsic =
          phase.isApplyExtrinsic && extrinsics_array.length
            ? extrinsics_array[Number.parseInt(phase.asApplyExtrinsic.toString())]
              : undefined;

        const query_event = new QueryEvent(record, height, index, extrinsic);

        // Reduce log verbosity and log only if a flag is set
        if (process.env.LOG_QUERY_EVENTS) {
          query_event.log(0, debug);
        }
        
        return query_event;
      }
    );

    const query_block = new QueryEventBlock(height, query_events);
    //this.emit('QueryEventBlock', query_block);
    debug(`Produced query event block.`);
    return query_block;
  }


  private async checkHeightOrWait(): Promise<void> {
    return await waitFor(
      // when to resolve
      () => this._block_to_be_produced_next <= this._height_of_chain,
      //exit condition
      () => !this._started )
    
  }

  public async * blockHeights(): AsyncGenerator<number> {
    while (this._started) {
      await this.checkHeightOrWait();
      debug(`Yield: ${this._block_to_be_produced_next.toString()}`);
      yield this._block_to_be_produced_next;
      this._block_to_be_produced_next++;
    }
  }

  
}
