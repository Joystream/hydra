import { IEventsSource } from './'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { GraphQLClient } from 'graphql-request'
import Debug from 'debug'
import { getConfig as conf } from '../start/config'
import { quotedJoin } from '../util/utils'
import { IndexerQuery } from './IEventsSource'
import { IndexerStatus } from '../state'

const debug = Debug('hydra-processor:graphql-source')

// to be replaced with a ws subsription
const GET_INDEXER_STATUS = `
query {
  indexerStatus {
    head
    chainHeight
  }
}
`

export class GraphQLSource implements IEventsSource {
  private graphClient: GraphQLClient

  constructor() {
    const _endpoint = conf().INDEXER_ENDPOINT_URL
    debug(`Using Indexer API endpoint ${_endpoint}`)
    this.graphClient = new GraphQLClient(_endpoint)
  }

  // TODO: implement
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  subscribe(events: string[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async indexerStatus(): Promise<IndexerStatus> {
    const status = await this.graphClient.request<{
      indexerStatus: IndexerStatus
    }>(GET_INDEXER_STATUS)
    return status.indexerStatus as IndexerStatus
  }

  async nextBatch<T>(
    queries: {
      [K in keyof T]: IndexerQuery
    }
  ): Promise<{ [K in keyof typeof queries]: SubstrateEvent[] }> {
    const query = collectQueries(queries)
    if (conf().VERBOSE) debug(`GraphqQL Query: ${query}`)

    const raw = await this.graphClient.request<
      { [K in keyof typeof queries]: SubstrateEvent[] }
    >(query)

    debug(
      `Fetched ${Object.keys(raw).reduce(
        (total, k) => total + raw[k as keyof typeof raw].length,
        0
      )} events`
    )

    if (conf().VERBOSE) debug(`Results: ${JSON.stringify(raw, null, 2)}`)

    return raw as { [K in keyof typeof queries]: SubstrateEvent[] }
  }
}

export function collectQueries(queries: {
  [key: string]: IndexerQuery
}): string {
  // we need to do this hack to be able to run multiple queries in a single request
  return `query {
    ${Object.keys(queries)
      .map((name) => `${name}: ${getEventsGraphQLQuery(queries[name])}`)
      .join('\n')}
  }`
}

// FIXME: refactor into a generic GraphQL query builder
export function getEventsGraphQLQuery({
  event,
  extrinsic,
  block,
  id,
  limit = conf().QUEUE_BATCH_SIZE,
}: IndexerQuery): string {
  const event_in = event.in || []
  const eventsFilter =
    event_in.length > 0 ? `name_in: [${quotedJoin(event_in)}],` : ''

  const extrinsic_in = extrinsic ? extrinsic.in || [] : []
  const extrinsicsFilter =
    extrinsic_in.length > 0
      ? `extrinsicName_in: [${quotedJoin(extrinsic_in)}],`
      : ''

  const idFilter = id.gt ? `afterID: "${id.gt}",` : ''

  // FIXME: very rough...
  const block_gte = block.gte || 0
  const block_lte = block.lte || Number.MIN_SAFE_INTEGER

  return `
  substrateEventsAfter(where: { ${eventsFilter}${extrinsicsFilter} blockNumber_gte: ${block_gte}, blockNumber_lte: ${block_lte} }, ${idFilter} limit: ${limit}) {
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
`
}
