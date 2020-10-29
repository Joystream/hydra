import { Container, Service } from 'typedi'
import * as IORedis from 'ioredis'
import { RedisClientFactory } from '@dzlzv/hydra-indexer-lib/lib'
import { INDEXER_HEAD_BLOCK } from '@dzlzv/hydra-indexer-lib/lib/indexer'
import { IndexerStatus } from './indexer-status.resolver'
import Debug from 'debug'

const debug = Debug('index-server:indexer-status-service')

const INDEXER_STATUS_KEY = 'hydra:indexer:status'

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

  async currentStatus(): Promise<IndexerStatus> {
    const result = await this.redisClient.hgetall(INDEXER_STATUS_KEY)

    debug(`Got status: ${JSON.stringify(result)}`)

    const status = new IndexerStatus()

    status.head = result ? Number.parseInt(result['HEAD']) : -1
    status.chainHeight = result ? Number.parseInt(result['CHAIN_HEIGHT']) : -1
    status.lastComplete = result ? Number.parseInt(result['LAST_COMPLETE']) : -1
    status.maxComplete = result ? Number.parseInt(result['MAX_COMPLETE']) : -1

    return status
  }
}
