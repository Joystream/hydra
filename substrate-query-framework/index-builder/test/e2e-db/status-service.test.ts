import * as dotenv from 'dotenv';
// we should set env variables before all other imports to 
// avoid config errors or warthog caused by DI
dotenv.config( { path: './test/.env' });
import { expect } from 'chai';
import { describe } from 'mocha';
import { IndexBuilder, QueryEventBlock } from '../../src';
import Container from 'typedi';
import { IndexerStatusService, IBlockProducer,  } from '../../src/indexer';
import { sleep } from '../../src/utils/wait-for';
import Debug from 'debug'; 
import { RedisRelayer } from '../../src/indexer/RedisRelayer';
import { RedisClientFactory } from '../../src/redis/RedisClientFactory';
import { queryEventBlock } from '../fixtures/qeb-factory';

const debug = Debug('index-builder:status-service-test')

const SLOW_BLOCK_HEIGHT = 4;
const FINAL_CHAIN_HEIGHT = 7;

class MockBlockProducer implements IBlockProducer<QueryEventBlock> {
  private height = 0;

  async fetchBlock(height: number): Promise<QueryEventBlock> {
    if (height === SLOW_BLOCK_HEIGHT) {
      await sleep(1000) // block 4 gonna be large and slow...
    } else {
      await sleep(5);
    }
    debug(`Fetched mock block at height ${height}`);
    return queryEventBlock(height);
  }

  async * blockHeights(): AsyncGenerator<number> {
    // we announce 7 blocks every 5 ms and then die
    while (this.height <= FINAL_CHAIN_HEIGHT) {
      yield this.height;   
      await sleep(5); // 
      this.height++;
    }
  }

  async start(height: number): Promise<void> {
    await sleep(10)
    debug(`Stated at height ${height}`)
  }
}

describe('IndexerStatusService', () => {
  
  let indexBuilder: IndexBuilder;
  let statusService: IndexerStatusService;
  
  beforeEach(() => {

    Container.set('BlockProducer', new MockBlockProducer());
    statusService = Container.get<IndexerStatusService>(IndexerStatusService);
    indexBuilder = Container.get<IndexBuilder>(IndexBuilder);
    Container.get<RedisRelayer>(RedisRelayer)
    
  })

  afterEach(async () => {
    await Container.get<RedisClientFactory>('RedisClientFactory').getClient().flushall();
  })

  it('should properly update indexer heads', async () => {
    await Promise.race([
      await indexBuilder.start(),
      await sleep(10)
    ]);
    let head = await statusService.getIndexerHead();
    // see MockBlockProducer for the block times
    expect(head).equals(SLOW_BLOCK_HEIGHT - 1, `Block ${SLOW_BLOCK_HEIGHT} is not processed yet`); // block no 4 is slow, so the indexer head is at height 3
    await sleep(1100); // now wait for block no 4 to be finished
    head = await statusService.getIndexerHead();
    expect(head).equals(FINAL_CHAIN_HEIGHT, `The indexer should eventually process all blockcs`);
    
  })

})