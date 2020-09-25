import Container, { Service } from 'typedi'
import { getIndexerHead } from '../db/dal';
import Debug from 'debug';
import * as IORedis from 'ioredis';
import { IndexBuilder } from '..';
import { logError } from '../utils/errors';
import { BlockPayload, BLOCK_START_CHANNEL, BLOCK_COMPLETE_CHANNEL } from './IndexBuilder';
import { stringifyWithTs } from '../utils/stringify';
const debug = Debug('index-builder:indexer');

export const INDEXER_NEW_HEAD_CHANNEL = 'hydra:indexer:head:new';
export const INDEXER_HEAD_BLOCK = 'hydra:indexer:head';
export const INDEXER_RECENTLY_COMPLETE_BLOCKS = 'hydra:indexer:block:recent';

@Service()
export class IndexerStatusService {

  
  // set containing the indexer block heights that are ahead 
  // of the current indexer head
  private _indexerHead = -1;
  private initialized = false;
  private redisSub: IORedis.Redis;
  private redisPub: IORedis.Redis;
  private redisClient: IORedis.Redis;

  constructor() {
    const clientFactory = Container.get<() => IORedis.Redis>('RedisClient');
    this.redisSub = clientFactory();
    this.redisPub = clientFactory();
    this.redisClient = clientFactory();
    this.redisSub.subscribe([BLOCK_START_CHANNEL, BLOCK_COMPLETE_CHANNEL])
    .then(() =>
      debug(`Subscribed to the indexer channels`)
    )
    .catch((e) => { throw new Error(e) });
    
    this.redisSub.on('message', (channel, message) => {
      debug(`Got message: ${message as string}`);
      if (channel === BLOCK_COMPLETE_CHANNEL) {
        this.onCompleteBlock((JSON.parse(message) as BlockPayload).height)
          .catch((e) => { throw new Error(`Error connecting to Redis: ${logError(e)}`) });
      }
    })
  }  
  
  async getIndexerHead(): Promise<number> {
    if (!this.initialized) {
      this._indexerHead 
      const headVal = await this.redisClient.get(INDEXER_HEAD_BLOCK);
      debug(`Got ${headVal || 'null'} from Redis cache`);
      if ( headVal !== null) {
        this._indexerHead = Number.parseInt(headVal);
      } else {
        debug(`Redis cache is empty, loading from the database`);
        this._indexerHead = await getIndexerHead();
        debug(`Loaded ${this._indexerHead}`);
        await this.updateHead();
      }
      this.initialized = true;
    }
    // TODO: replace with a Redis call or GraphQL subscription
    return this._indexerHead;
  }

  private async updateHead(): Promise<void> {
    await this.redisClient.set(INDEXER_HEAD_BLOCK, this._indexerHead);
    await this.redisPub.publish(INDEXER_NEW_HEAD_CHANNEL, stringifyWithTs({height: this._indexerHead}))
  }

  /**
   * 
   * @param h height of the completed block
   */
  async onCompleteBlock(h: number): Promise<void> {
    debug(`On complete block: ${h}`);
    await this.redisClient.sadd(INDEXER_RECENTLY_COMPLETE_BLOCKS, `${h}`);
    
    let nextHead = this._indexerHead + 1;
    let nextHeadComplete = true;
    while (nextHeadComplete) {
      const resp = await this.redisClient.sismember(INDEXER_RECENTLY_COMPLETE_BLOCKS, `${nextHead}`);
      nextHeadComplete = (resp === 1); // ismember returned true;
      if (!nextHeadComplete) {
        break;
      }
      
      await this.redisClient.set(INDEXER_HEAD_BLOCK, nextHead);
      debug(`Updated indexer head to ${nextHead}`);
      // remove from the set as we don't need to keep it anymore
      await this.redisClient.srem(INDEXER_RECENTLY_COMPLETE_BLOCKS, this._indexerHead);
      this._indexerHead = nextHead;
      await this.updateHead();
      nextHead++;
    }
  }

}