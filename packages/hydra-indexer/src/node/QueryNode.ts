// @ts-check
import { IndexBuilder } from '..'
import { getConfig } from '.'
import Debug from 'debug'

import Container, { Inject, Service } from 'typedi'

import { RedisClientFactory } from '@dzlzv/hydra-db-utils'
import { waitFor } from '@dzlzv/hydra-common'
import { RedisRelayer } from '../indexer/RedisRelayer'

const debug = Debug('index-builder:query-node')

export enum QueryNodeState {
  NOT_STARTED,
  BOOTSTRAPPING,
  STARTING,
  STARTED,
  STOPPING,
  STOPPED,
}

@Service('QueryNode')
export class QueryNode {
  // State of the node,
  private _state: QueryNodeState

  // Query index building node.
  @Inject('IndexBuilder')
  readonly indexBuilder!: IndexBuilder

  private constructor() {
    this._state = QueryNodeState.NOT_STARTED

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  }

  static async create(): Promise<QueryNode> {
    // TODO: Do we really need to do it like this?
    // Its pretty ugly, but the registrtion appears to be
    // accessing some sort of global state, and has to be done after
    // the provider is created.

    Container.set(
      'RedisClientFactory',
      new RedisClientFactory(getConfig().REDIS_URI)
    )
    Container.set('RedisRelayer', new RedisRelayer())
    return Container.get<QueryNode>('QueryNode')
  }

  async start(): Promise<void> {
    if (this._state !== QueryNodeState.NOT_STARTED)
      throw new Error('Starting requires ')

    this._state = QueryNodeState.STARTED

    // Start only the indexer
    try {
      await this.indexBuilder.start()
    } catch (e) {
      process.exitCode = -1
    } finally {
      // if due tot error, it will bubble up
      debug(`Stopping the query node`)
      // stop only when the indexer has stopped or thrown an error
      this._state = QueryNodeState.STOPPED
    }
  }

  async stop(): Promise<void> {
    debug(`Query node state: ${this._state}`)
    if (this._state !== QueryNodeState.STARTED) {
      debug('Query node is not running')
      return
    }

    this._state = QueryNodeState.STOPPING

    await this.indexBuilder.stop()

    await waitFor(() => this.state === QueryNodeState.STOPPED)
  }

  get state(): QueryNodeState {
    return this._state
  }
}
