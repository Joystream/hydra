import { IProcessorSource, EventFilter } from '.';
import { SubstrateEvent } from '../model';
import { ProcessorOptions } from '../node';
import { GraphQLClient } from 'graphql-request';
import { Inject } from 'typedi';
import Debug from 'debug';

const debug = Debug('index-builder:processor');

const GET_EVENTS_AFTER_QUERY = `
query GetEventsAfterID( $afterID: ID, $names: [String!]!, $fromBlock: Int, $toBlock: Int, $size: Int) {
  substrateEventsAfter(where: { name_in: $names, blockNumber_gte: $fromBlock, blockNumber_lt: $toBlock }, afterID: $afterID, limit: $size) {
    id
    name 
    method
    params {
      name
      type
      value
    }
    index 
    blockNumber
    extrinsic {
      method
      section
      versionInfo
      signer
      args
      signature
      hash
      tip
    }
  }
}
`

// to be replaced with a ws subsription 
const GET_INDEXER_HEAD = `
query {
  indexerStatus() {
    head
  }
}
`


export class GraphQLSource implements IProcessorSource {
  private graphClient: GraphQLClient;

  constructor(@Inject('ProcessorOptions') protected options: ProcessorOptions) {
    const _endpoint = options.indexerEndpointURL || process.env.INDEXER_ENDPOINT_URL;
    if (!_endpoint) {
      throw new Error(`Indexer endpoint is not provided`);
    }
    debug(`Using Indexer API endpoint ${_endpoint}`);
    this.graphClient = new GraphQLClient(_endpoint);
  }


  async indexerHead(): Promise<number> {
    const status = await this.graphClient.request<{ indexerStatus: { head: number } }>(GET_INDEXER_HEAD);
    return status.indexerStatus.head
  }

  async nextBatch(filter: EventFilter, size: number): Promise<SubstrateEvent[]> {
    debug(`Filter: ${JSON.stringify(filter, null, 2)}`)
    const data = await this.graphClient.request<{ substrateEventsAfter: SubstrateEvent[] }>(GET_EVENTS_AFTER_QUERY, 
      { size, 
        names: filter.names, 
        afterID: filter.afterID,
        fromBlock: filter.fromBlock,
        toBlock: filter.toBlock
      });
    debug(`Fetched ${data.substrateEventsAfter.length} events`);
    debug(`Events: ${JSON.stringify(data, null, 2)} events`);
    return data.substrateEventsAfter;

  }


  
}