import { RedisOptions } from 'ioredis'
import * as IORedis from 'ioredis'
import Debug from 'debug'
import { logError } from '@subsquid/hydra-common/lib'
const debug = Debug('index-builder:redis-factory')

export class RedisClientFactory {
  private clients: IORedis.Redis[] = []
  private factoryMetod: () => IORedis.Redis

  public constructor(redisURI?: string, options?: RedisOptions) {
    if (options) {
      this.factoryMetod = () => new IORedis(options)
      debug(`Using RedisOptions`)
      return
    }

    const uri = redisURI || process.env.REDIS_URI
    if (uri) {
      this.factoryMetod = () => new IORedis(uri)
      debug(`Using ${uri} for Redis clients`)
    } else {
      throw new Error(`Redis URL is not provided`)
    }
  }

  getClient(): IORedis.Redis {
    const client = this.factoryMetod()
    this.clients.push(client)
    return client
  }

  stop(): void {
    for (const client of this.clients) {
      if (client) {
        try {
          client.disconnect()
        } catch (e) {
          debug(`Failed to disconnect redis client: ${logError(e)}`)
        }
      }
    }
  }
}
