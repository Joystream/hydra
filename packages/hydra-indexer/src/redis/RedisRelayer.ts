import Container, { Service } from 'typedi'
import { BLOCK_COMPLETE_CHANNEL, BLOCK_START_CHANNEL } from './redis-keys'
import Debug from 'debug'
import { stringifyWithTs, logError } from '@dzlzv/hydra-common'
import { RedisClientFactory } from '@dzlzv/hydra-db-utils'
import { eventEmitter } from '../node/event-emitter'
import IORedis = require('ioredis')

const debug = Debug('index-builder:redis-relayer')

/**
 *  This class is listening to local events and relays them to Redis
 *  The main reason for it is to decouple most of the core classes from the
 *  Redis infrastructure
 **/
@Service()
export class RedisRelayer {
  private redisPub: IORedis.Redis

  public constructor() {
    const clientFactory = Container.get<RedisClientFactory>(
      'RedisClientFactory'
    )
    this.redisPub = clientFactory.getClient()
    // Relay local events globablly via redis
    const events = [BLOCK_COMPLETE_CHANNEL, BLOCK_START_CHANNEL]
    events.forEach((event) => {
      eventEmitter.on(event, (data) => this.relayToRedis(event, data))
    })
  }

  private relayToRedis(topic: string, data: Record<string, unknown>) {
    debug(`Relaying to redis: ${topic} ${JSON.stringify(data)}`)
    this.redisPub
      .publish(topic, stringifyWithTs(data))
      .catch((e) => debug(`${logError(e)}`))
  }
}
