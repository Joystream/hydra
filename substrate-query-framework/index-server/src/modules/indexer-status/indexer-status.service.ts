import { Container, Service } from 'typedi'
import * as IORedis from 'ioredis'
import { RedisClientFactory } from '@dzlzv/hydra-indexer-lib/lib'
import { INDEXER_HEAD_BLOCK } from '@dzlzv/hydra-indexer-lib/lib/indexer'

@Service('IndexerStatusService')
export class IndexerStatusService {
  // for subscriptions
  private redisSub: IORedis.Redis
  // for normal ops
  private redisClient: IORedis.Redis

  constructor() {
    const factory = Container.get<RedisClientFactory>('RedisClientFactory')
    this.redisSub = factory.getClient()
    this.redisClient = factory.getClient()
  }

  async currentIndexerHead(): Promise<number> {
    const head = await this.redisClient.get(INDEXER_HEAD_BLOCK)
    if (head == null) {
      return -1
    }
    return Number.parseInt(head as string)
  }
}
