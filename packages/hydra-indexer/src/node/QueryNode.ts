// @ts-check
import { ApiPromise, WsProvider /* RuntimeVersion */ } from '@polkadot/api'

import { IndexBuilder } from '..'
import { IndexerOptions } from '.'
import Debug from 'debug'

import Container, { Inject, Service } from 'typedi'

import { RedisClientFactory } from '@dzlzv/hydra-db-utils'
import { retry, waitFor } from '@dzlzv/hydra-common'
import { SUBSTRATE_API_CALL_RETRIES } from '../indexer/indexer-consts'
import { RedisRelayer } from '../indexer/RedisRelayer'

import { typesBundle, typesChain, typesSpec } from '@dzlzv/apps-config'
import registry from '../substrate/typeRegistry'

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

  @Inject('IndexerOptions')
  private indexerOptions!: IndexerOptions

  private constructor() {
    this._state = QueryNodeState.NOT_STARTED

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  }

  static async create(options: IndexerOptions): Promise<QueryNode> {
    // TODO: Do we really need to do it like this?
    // Its pretty ugly, but the registrtion appears to be
    // accessing some sort of global state, and has to be done after
    // the provider is created.
    Container.set('IndexerOptions', options)

    const { wsProviderURI, types } = options

    await QueryNode.createApi(wsProviderURI, types)

    const redisURL = options.redisURI || process.env.REDIS_URI
    Container.set('RedisClientFactory', new RedisClientFactory(redisURL))
    Container.set('RedisRelayer', new RedisRelayer())
    const node = Container.get<QueryNode>('QueryNode')
    node.indexerOptions = options
    return node
  }

  static async createApi(
    wsProviderURI: string,
    types: Record<string, Record<string, string>> = {}
  ): Promise<void> {
    const provider = new WsProvider(wsProviderURI)

    const names = Object.keys(types)

    names.length && debug(`Injected types: ${names.join(', ')}`)

    // Create the API and wait until ready
    // TODO: move to substrate
    const api = await retry(
      () =>
        new ApiPromise({
          provider,
          registry,
          types,
          typesBundle,
          typesChain,
          typesSpec,
        }).isReadyOrError,
      SUBSTRATE_API_CALL_RETRIES
    )

    debug(`Api is ready`)

    Container.set('ApiPromise', api)

    //debug(`Api is set: ${JSON.stringify(api, null, 2)}`)
  }

  async start(): Promise<void> {
    if (this._state !== QueryNodeState.NOT_STARTED)
      throw new Error('Starting requires ')

    this._state = QueryNodeState.STARTED

    // Start only the indexer
    try {
      await this.indexBuilder.start(this.indexerOptions.atBlock)
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
