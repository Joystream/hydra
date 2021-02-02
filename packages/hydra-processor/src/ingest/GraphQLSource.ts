import { IProcessorSource, EventQuery } from './'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { GraphQLClient } from 'graphql-request'
import Debug from 'debug'
import { conf } from '../start/config'

const debug = Debug('index-builder:processor')

const GET_EVENTS_AFTER_QUERY = `
query GetEventsAfterID( $afterID: ID, $names: [String!]!, $fromBlock: Int, $toBlock: Int, $size: Int) {
  substrateEventsAfter(where: { name_in: $names, blockNumber_gte: $fromBlock, blockNumber_lte: $toBlock }, afterID: $afterID, limit: $size) {
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
    blockTimestamp
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
  indexerStatus {
    head
  }
}
`

export class GraphQLSource implements IProcessorSource {
  private graphClient: GraphQLClient

  constructor() {
    const _endpoint = conf.INDEXER_ENDPOINT_URL
    debug(`Using Indexer API endpoint ${_endpoint}`)
    this.graphClient = new GraphQLClient(_endpoint)
  }

  // TODO: implement
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  subscribe(events: string[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async indexerHead(): Promise<number> {
    const status = await this.graphClient.request<{
      indexerStatus: { head: number }
    }>(GET_INDEXER_HEAD)
    return status.indexerStatus.head
  }

  async nextBatch(filter: EventQuery, size: number): Promise<SubstrateEvent[]> {
    debug(`Filter: ${JSON.stringify(filter, null, 2)}`)
    const data = await this.graphClient.request<{
      substrateEventsAfter: SubstrateEvent[]
    }>(GET_EVENTS_AFTER_QUERY, {
      size,
      names: filter.names,
      afterID: filter.id_gt,
      fromBlock: filter.block_gte,
      toBlock: filter.block_lte,
    })
    debug(`Fetched ${data.substrateEventsAfter.length} events`)
    debug(`Events: ${JSON.stringify(data, null, 2)} events`)
    return data.substrateEventsAfter
  }
}
