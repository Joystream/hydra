import Container, { Service } from 'typedi'
import { getIndexerHead as slowIndexerHead } from '../db/dal';
import Debug from 'debug';
import * as IORedis from 'ioredis';
import { logError } from '../utils/errors';
import { BlockPayload } from './IndexBuilder';
import { stringifyWithTs } from '../utils/stringify';
import { INDEXER_HEAD_BLOCK, 
  INDEXER_NEW_HEAD_CHANNEL, 
  INDEXER_RECENTLY_COMPLETE_BLOCKS, 
  BLOCK_START_CHANNEL, BLOCK_COMPLETE_CHANNEL, EVENT_LAST, EVENT_TOTAL } from './redis-consts';
import { IStatusService } from './IStatusService';

const debug = Debug('index-builder:status-server');

@Service('StatusService')
export class IndexerStatusService implements IStatusService {

  private redisSub: IORedis.Redis;
  private redisPub: IORedis.Redis;
  private redisClient: IORedis.Redis;

  constructor() {
    const clientFactory = Container.get<() => IORedis.Redis>('RedisClientFactory');
    this.redisSub = clientFactory();
    this.redisPub = clientFactory();
    this.redisClient = clientFactory();
    this.redisSub.subscribe([BLOCK_START_CHANNEL, BLOCK_COMPLETE_CHANNEL])
    .then(() =>
      debug(`Subscribed to the indexer channels`)
    )
    .catch((e) => { throw new Error(e) });
    
    this.redisSub.on('message', (channel, message) => {
      this.onNewMessage(channel, message)
          .catch((e) => { throw new Error(`Error connecting to Redis: ${logError(e)}`) })
    })
  
  }  


  async onBlockComplete(payload: BlockPayload): Promise<void> {
    if (await this.isComplete(payload.height)) {
      debug(`Ignoring ${payload.height}: already processed`);
      return;
    }
    await this.updateIndexerHead(payload.height);
    await this.updateLastEvents(payload);
  }


  async onNewMessage(channel: string, message: string): Promise<void> {
    if (channel === BLOCK_COMPLETE_CHANNEL) {
      const payload = JSON.parse(message) as BlockPayload;
      await this.onBlockComplete(payload);
    }
  }

  async getIndexerHead(): Promise<number> {
    const headVal = await this.redisClient.get(INDEXER_HEAD_BLOCK);
    if ( headVal !== null) {
      return Number.parseInt(headVal);
    } 

    debug(`Redis cache is empty, loading from the database`);
    const _indexerHead = await slowIndexerHead();
    debug(`Loaded ${_indexerHead}`);
    await this.updateHeadKey(_indexerHead);
    return _indexerHead;
  }
     

  private async updateHeadKey(height: number): Promise<void> {
    await this.redisClient.set(INDEXER_HEAD_BLOCK, height);
    await this.redisPub.publish(INDEXER_NEW_HEAD_CHANNEL, stringifyWithTs({ height }))
    debug(`Updated the indexer head to ${height}`);
  }

  async updateLastEvents(payload: BlockPayload): Promise<void> {
    if (!payload.events) {
      debug(`No events in the payload`);
      return;
    }
    for (const e of payload.events) {
      await this.redisClient.hset(EVENT_LAST, e.name, e.id);
      await this.redisClient.hincrby(EVENT_TOTAL, e.name, 1);
      await this.redisClient.hincrby(EVENT_TOTAL, 'ALL', 1);
    }
  }

  async isComplete(h: number): Promise<boolean> {
    const head = await this.getIndexerHead(); // this op is fast
    if (h <= head) {
       return true;
    }
    const isRecent = await this.redisClient.sismember(INDEXER_RECENTLY_COMPLETE_BLOCKS, `${h}`);
    return (isRecent === 1); // ismember returned true;
  }

  /**
   * 
   * @param h height of the completed block
   */
  async updateIndexerHead(h: number): Promise<void> {
    debug(`On complete block: ${h}`);
    await this.redisClient.sadd(INDEXER_RECENTLY_COMPLETE_BLOCKS, `${h}`);
    
    let nextHead = await this.getIndexerHead();
    let nextHeadComplete = true;
    const toPrune = [];
    while (nextHeadComplete) {
      nextHeadComplete = await this.isComplete(nextHead + 1); // ismember returned true;
      // remove from the set as we don't need to keep it anymore
      if (nextHeadComplete) {
        toPrune.push(nextHead);
        debug(`Queued ${nextHead} for pruning from the recent blocks`);
        nextHead++;
      } 
    }

    const currentHead = await this.getIndexerHead();
    if (nextHead > currentHead) {
      debug(`Updating the indexer head from ${currentHead} to ${nextHead}`);
      await this.updateHeadKey(nextHead);
      // the invariant here is that we never
      // prune heights that are less than the current indexer head
      // We may have some leftovers due to concurrency 
      await this.pruneRecent(toPrune)
    }
  }

  async pruneRecent(heights: number[]): Promise<void> {
    for (const h of heights) {
      await this.redisClient.srem(INDEXER_RECENTLY_COMPLETE_BLOCKS, h);
    } 
    debug(`Pruned ${heights.length} elements`);
  }
}