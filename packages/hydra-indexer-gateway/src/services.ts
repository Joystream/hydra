import Container from 'typedi'
import { Config } from 'warthog'
import { RedisClientFactory } from '@joystream/hydra-db-utils'
import Debug from 'debug'
const debug = Debug('index-server:index')
/**
 * Called on the server bootstrap
 *
 */
export function initServices(): void {
  initRedisFactory()
  debug(`Service init complete`)
}

export function shutdownServices(): void {
  debug(`Shutting down background services`)
  shutdownRedisFactory()
}

function initRedisFactory() {
  const config = Container.get<Config>('Config')
  config.validateEntryExists('WARTHOG_REDIS_URI')
  Container.set(
    'RedisClientFactory',
    new RedisClientFactory(config.get('WARTHOG_REDIS_URI') as string)
  )
}

function shutdownRedisFactory() {
  const redisFactory = Container.get<RedisClientFactory>('RedisClientFactory')
  redisFactory.stop()
}
