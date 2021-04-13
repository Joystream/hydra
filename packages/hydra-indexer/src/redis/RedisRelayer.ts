import { BLOCK_COMPLETE_CHANNEL, BLOCK_START_CHANNEL } from './redis-keys'
import Debug from 'debug'
import { stringifyWithTs, logError } from '@dzlzv/hydra-common'
import { eventEmitter } from '../node/event-emitter'
import { getRedisFactory } from './client-factory'
import * as IORedis from 'ioredis'

const debug = Debug('index-builder:redis-relayer')

/**
 *  This class is listening to local events and relays them to Redis
 *  The main reason for it is to decouple most of the core classes from the
 *  Redis infrastructure
 **/
class RedisRelayer implements PubSub {
  private redisPub: IORedis.Redis

  public constructor() {
    const clientFactory = getRedisFactory()
    this.redisPub = clientFactory.getClient()
  }

  listen() {
    // Relay local events globablly via redis
    const events = [BLOCK_COMPLETE_CHANNEL, BLOCK_START_CHANNEL]
    events.forEach((event) => {
      eventEmitter.on(event, (data) => this.publish(event, data))
    })
  }

  publish(topic: string, data: Record<string, unknown>): void {
    debug(`Relaying to redis: ${topic} ${JSON.stringify(data)}`)
    this.redisPub
      .publish(topic, stringifyWithTs(data))
      .catch((e) => debug(`${logError(e)}`))
  }
}

export interface PubSub {
  publish(topic: string, data: Record<string, unknown>): void
}

let relayer: RedisRelayer

export function getPubSub(): PubSub {
  if (relayer) {
    return relayer
  }
  initPubSub()
  return relayer
}

// TODO: implement more flexible pubsub
export function initPubSub(): void {
  if (relayer) {
    return
  }
  relayer = new RedisRelayer()
  relayer.listen()
}