import { IProcessorSource, EventFilter } from '.';
import { SubstrateEvent } from '../model';
import { ProcessorOptions } from '../node';
import { GraphQLClient } from 'graphql-request';
import { Inject } from 'typedi';
import Debug from 'debug';

const debug = Debug('index-builder:processor');

const GET_EVENTS_AFTER_QUERY = `
query GetEventsAfterID( $afterID: ID, $names: [String!]!, $size: Int) {
  substrateEventsAfter(where: { name_in: $names }, afterID: $afterID, limit: $size) {
    events {
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
    totalCount
  }
}
`


interface EventsAfterData {
  substrateEventsAfter: {
    events: Array<SubstrateEvent>,
    totalCount: number
  }
}


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

  async nextBatch(filter: EventFilter, size: number): Promise<SubstrateEvent[]> {
    debug(`Filter: ${JSON.stringify(filter, null, 2)}`)
    const data = await this.graphClient.request<EventsAfterData>(GET_EVENTS_AFTER_QUERY, { size, names: filter.names, afterID: filter.afterID});
    debug(`Events remaining: ${data.substrateEventsAfter.totalCount}`);
    return data.substrateEventsAfter.events;

  }


  
}