import { RedisClientFactory } from '@joystream/hydra-db-utils'
import { getConfig } from '..'
import { eventEmitter, IndexerEvents } from '../node/event-emitter'
import Debug from 'debug'
const debug = Debug('index-builder:redis-factory')

let clientFactory: RedisClientFactory

export function getRedisFactory(): RedisClientFactory {
  if (clientFactory) {
    return clientFactory
  }
  debug(`Initializing Redis Client Factory`)
  clientFactory = new RedisClientFactory(getConfig().REDIS_URI)
  return clientFactory
}

eventEmitter.on(IndexerEvents.INDEXER_STOP, () => {
  if (clientFactory) {
    debug(`Closing Redis connections`)
    clientFactory.stop()
  }
})
