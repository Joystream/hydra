// @ts-check

import { ApiPromise, WsProvider /*RuntimeVersion*/ } from '@polkadot/api';

import { makeSubstrateService, IndexBuilder } from '..';
import { IndexerOptions } from '.';
import Debug from 'debug';

const debug = Debug('index-builder:query-node');


export enum QueryNodeState {
  NOT_STARTED,
  BOOTSTRAPPING,
  STARTING,
  STARTED,
  STOPPING,
  STOPPED,
}

export class QueryNode {
  // State of the node,
  private _state: QueryNodeState;

  // ..
  private _websocketProvider: WsProvider;

  // API instance for talking to Substrate full node.
  private _api: ApiPromise;

  // Query index building node.
  private _indexBuilder: IndexBuilder;

  private _atBlock?: number;

  private constructor(websocketProvider: WsProvider, api: ApiPromise, indexBuilder: IndexBuilder, atBlock?: number) {
    this._state = QueryNodeState.NOT_STARTED;
    this._websocketProvider = websocketProvider;
    this._api = api;
    this._indexBuilder = indexBuilder;
    this._atBlock = atBlock;

    this._websocketProvider.on('error', async () => {
      debug(`Disconnected.`)
      if (this.state == QueryNodeState.STARTED) {
        await this.stop();
        throw new Error(`WS provider has been disconnected. Shutting down the node`);
      }
      debug(`Disconnected. Waiting until the the node stopped...`)
    })
  }

  static async create(options: IndexerOptions): Promise<QueryNode> {
    // TODO: Do we really need to do it like this?
    // Its pretty ugly, but the registrtion appears to be
    // accessing some sort of global state, and has to be done after
    // the provider is created.

    const { wsProviderURI, typeRegistrator, atBlock } = options;

    // Initialise the provider to connect to the local node
    const provider = new WsProvider(wsProviderURI);

    // Register types before creating the api
    typeRegistrator ? typeRegistrator() : null;

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider });

    const service = makeSubstrateService(api);

    const index_buider = IndexBuilder.create(service);

    return new QueryNode(provider, api, index_buider, atBlock);
  }

  async start(): Promise<void> {
    if (this._state != QueryNodeState.NOT_STARTED) throw new Error('Starting requires ');

    this._state = QueryNodeState.STARTED;

    // Start only the indexer
    await this._indexBuilder.start(this._atBlock);
    
  }

  async stop(): Promise<void> {
    debug(`Query node state: ${this._state}`);
    if (this._state != QueryNodeState.STARTED) throw new Error('Can only stop once fully started');

    this._state = QueryNodeState.STOPPING;

    await this._indexBuilder.stop();

    this._state = QueryNodeState.STOPPED;
  }

  get state(): QueryNodeState {
    return this._state;
  }
}
