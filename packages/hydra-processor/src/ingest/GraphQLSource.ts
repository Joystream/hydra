import { IEventsSource, EventQuery, IndexerStatus } from './'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { GraphQLClient } from 'graphql-request'
import Debug from 'debug'
import { conf } from '../start/config'
import { quotedJoin } from '../util/utils'

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
    const _endpoint = conf.INDEXER_ENDPOINT_URL
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
    return status.indexerStatus
  }

  async nextBatch(
    queries: EventQuery[],
    size: number
  ): Promise<SubstrateEvent[]> {
    const query = collectQueries(
      queries.map((f) => getEventsGraphQLQuery(f, size))
    )
    if (conf.VERBOSE) debug(`GraphqQL Query: ${query}`)

    const raw = await this.graphClient.request<
      Record<string, SubstrateEvent[]>
    >(query)

    const data: SubstrateEvent[] = Object.keys(raw)
      .reduce((acc: SubstrateEvent[], key) => [...acc, ...raw[key]], [])
      .sort((a, b) => (a.id < b.id ? -1 : 1))

    debug(`Fetched ${data.length} events`)

    if (conf.VERBOSE) debug(`Events: ${JSON.stringify(data, null, 2)} events`)

    return data.slice(0, size)
  }
}

export function collectQueries(queries: string[]) {
  // we need to do this hack to be able to run multiple queries in a single request
  return `query {
    ${queries.map((q, i) => `query${i}: ${q}`).join('\n')}
  }`
}

export function getEventsGraphQLQuery(
  { events, extrinsics, block_gte, block_lte, id_gt }: EventQuery,
  limit: number
): string {
  const eventsFilter =
    events.length > 0 ? `name_in: [${quotedJoin(events)}],` : ''
  const extrinsicsFilter =
    extrinsics && extrinsics.length > 0
      ? `extrinsicName_in: [${quotedJoin(extrinsics)}],`
      : ''
  const idFilter = id_gt ? `afterID: "${id_gt}",` : ''

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
