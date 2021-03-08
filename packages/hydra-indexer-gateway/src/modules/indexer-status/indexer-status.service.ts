import { Container, Service } from 'typedi'
import * as IORedis from 'ioredis'
import { RedisClientFactory } from '@dzlzv/hydra-db-utils'
import { IndexerStatus } from './indexer-status.resolver'
import Debug from 'debug'
import { hydraVersion } from '../../version'
import { Logger } from '../../logger'
import { logError } from '@dzlzv/hydra-common'

const debug = Debug('index-server:indexer-status-service')

const INDEXER_STATUS_KEY = 'hydra:indexer:status'
const INDEXER_HEAD_BLOCK = 'hydra:indexer:head'

@Service('IndexerStatusService')
export class IndexerStatusService {
  // for normal ops
  private redisClient: IORedis.Redis

  constructor() {
    const factory = Container.get<RedisClientFactory>('RedisClientFactory')
    this.redisClient = factory.getClient()
  }

  async currentStatus(): Promise<IndexerStatus> {
    let result
    try {
      result = await this.redisClient.hgetall(INDEXER_STATUS_KEY)
    } catch (e) {
      Logger.error(`Error connecting to redis: ${logError(e)}`)
      throw new Error(`Server errror: Redis service is unavailable`)
    }

    debug(`Got status: ${JSON.stringify(result)}`)

    const status = new IndexerStatus()

    status.head = this.getNumberOrDefault(result, 'HEAD')
    status.chainHeight = this.getNumberOrDefault(result, 'CHAIN_HEIGHT')
    status.lastComplete = this.getNumberOrDefault(result, 'LAST_COMPLETE')
    status.maxComplete = this.getNumberOrDefault(result, 'MAX_COMPLETE')

    status.inSync = status.chainHeight === status.head && status.head > 0
    status.hydraVersion = hydraVersion
    return status
  }

  getNumberOrDefault(
    obj: Record<string, string>,
    hash: string,
    def = -1
  ): number {
    if (obj === null || obj === undefined) {
      return def
    }
    if (
      obj[hash] === null ||
      obj[hash] === undefined ||
      obj[hash].length === 0
    ) {
      return def
    }
    const val = Number.parseInt(obj[hash])
    return Number.isFinite(val) ? val : def
  }
}
