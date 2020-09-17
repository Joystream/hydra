// @ts-check
import { QueryEventBlock } from '../model';
import { BlockProducer } from '.';
import * as _ from 'lodash';

import Debug from 'debug';
import { doInTransaction } from '../db/helper';
import { PooledExecutor } from './PooledExecutor';
import { SubstrateEventEntity } from '../entities';
import { numberEnv } from '../utils/env-flags';
import { getIndexerHead } from '../db/dal';
import { ISubstrateService } from '../substrate';
import { getConnection } from 'typeorm';

const debug = Debug('index-builder:indexer');

const WORKERS_NUMBER = numberEnv('INDEXER_WORKERS') || 50;

export class IndexBuilder {
  private _producer!: BlockProducer;
  private _stopped = false;

  private _indexingTimer = new Date().getMilliseconds();

  private _indexerHead = -1;

  // set containing the indexer block heights that are ahead 
  // of the current indexer head
  private _recentlyIndexedBlocks = new Set<number>();

  private constructor(producer: BlockProducer) {
    this._producer = producer;
  }

  static create(service: ISubstrateService): IndexBuilder {
    const producer = new BlockProducer(service);

    return new IndexBuilder(producer);
  }

  async start(atBlock?: number): Promise<void> {
    debug('Spawned worker.');
    
    this._indexerHead = await getIndexerHead();
    
    debug(`Last indexed block in the database: ${this._indexerHead.toString()}`);
    let startBlock = this._indexerHead + 1;
    
    if (atBlock) {
      debug(`Got block height hint: ${atBlock}`);
      if (this._indexerHead >= 0 && process.env.FORCE_BLOCK_HEIGHT !== 'true') {
        debug(
          `WARNING! The database contains indexed blocks.
          The last indexed block height is ${this._indexerHead}. The indexer 
          will continue from block ${this._indexerHead} ignoring the start 
          block height hint. Set the environment variable FORCE_BLOCK_HEIGHT to true 
          if you want to start from ${atBlock} anyway.`
        );
      } else {
        startBlock = Math.max(startBlock, atBlock);
        this._indexerHead = startBlock - 1;
      }
    }

    debug(`Starting the block indexer at block ${startBlock}`);

    await this._producer.start(startBlock);

    const poolExecutor = new PooledExecutor(WORKERS_NUMBER, this._producer.blockHeights(), this._indexBlock());
    
    debug('Started a pool of indexers.');

    await poolExecutor.run(() => this._stopped);

  }

  async stop(): Promise<void> { 
    debug('Stopping the indexer and closing the DB connection');
    await getConnection().close();
    debug('Index builder has been stopped');
    this._stopped = true;
  }

  _indexBlock(): (h: number) => Promise<void> {
    return async (h: number) => {
      debug(`Processing block #${h.toString()}`);  
      const queryEventsBlock: QueryEventBlock = await this._producer.fetchBlock(h);
      const batches = _.chunk(queryEventsBlock.query_events, 100);
      debug(`Read ${queryEventsBlock.query_events.length} events; saving in ${batches.length} batches`);  
      
      await doInTransaction(async (queryRunner) => {
        debug(`Saving event entities`);

        let saved = 0;
        for (let batch of batches) {
          const qeEntities = batch.map((event) => SubstrateEventEntity.fromQueryEvent(event));
          await queryRunner.manager.save(qeEntities);
          saved += qeEntities.length;
          batch = [];
          debug(`Saved ${saved} events`);
        }
        debug(`Done block #${h.toString()}`);
      });

      this._recentlyIndexedBlocks.add(h);
      this._updateIndexerHead();
    }
  }

  private _updateIndexerHead(): void {
    let nextHead = this._indexerHead + 1;
    while (this._recentlyIndexedBlocks.has(nextHead)) {
      this._indexerHead = nextHead;

      if (this._indexerHead % 100 === 0) {
        const _newTime = new Date().getMilliseconds();
        debug(`Indexed 100 blocks in ${_newTime - this._indexingTimer} ms`);
        this._indexingTimer = _newTime;
      }

      debug(`Updated indexer head to ${this._indexerHead}`);
      // remove from the set as we don't need to keep it anymore
      this._recentlyIndexedBlocks.delete(nextHead);
      nextHead++;
    }
  }

  public get indexerHead(): number {
    return this._indexerHead;
  }
  
}
