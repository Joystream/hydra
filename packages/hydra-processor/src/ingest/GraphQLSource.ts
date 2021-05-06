import { IProcessorSource, AsJson } from './'
import {
  FIFOCache,
  SubstrateBlock,
  SubstrateEvent,
  SubstrateExtrinsic,
} from '@dzlzv/hydra-common'
import { GraphQLClient } from 'graphql-request'
import Debug from 'debug'
import { getConfig as conf } from '../start/config'
import { quotedJoin } from '../util/utils'
import { GraphQLQuery, IndexerQuery } from './IProcessorSource'
import { IndexerStatus } from '../state'
import { collectNamedQueries } from './graphql-query-builder'
import { compact } from 'lodash'

const debug = Debug('hydra-processor:graphql-source')

type SubstrateType = SubstrateBlock | SubstrateEvent | SubstrateExtrinsic

const REVIVE_SUBSTRATE_FIELDS: Partial<
  {
    [P in keyof SubstrateType]: SubstrateType[P] extends number | BigInt
      ? 'BigInt' | 'Number'
      : never
  }
> = {
  'timestamp': 'Number',
  'tip': 'BigInt',
  'blockTimestamp': 'Number',
}

// to be replaced with a ws subsription
const GET_INDEXER_STATUS = `
query {
  indexerStatus {
    head
    chainHeight
    hydraVersion
  }
}
`

export class GraphQLSource implements IProcessorSource {
  private graphClient: GraphQLClient
  private blockCache: FIFOCache<number, SubstrateBlock>

  constructor() {
    const _endpoint = conf().INDEXER_ENDPOINT_URL
    debug(`Using Indexer API endpoint ${_endpoint}`)
    this.graphClient = new GraphQLClient(_endpoint)
    this.blockCache = new FIFOCache<number, SubstrateBlock>(
      conf().BLOCK_CACHE_CAPACITY
    )
  }

  // TODO: implement
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  subscribe(events: string[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async getIndexerStatus(): Promise<IndexerStatus> {
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

    // const raw = await this.graphClient.request<
    //   { [K in keyof typeof queries]: SubstrateEvent[] }
    // >(query)

    const raw = await this.requestSubstrateData<
      { [K in keyof typeof queries]: SubstrateEvent[] }
    >(query)

    debug(
      `Fetched ${Object.keys(raw).reduce(
        (total, k) => total + raw[k as keyof typeof raw].length,
        0
      )} events`
    )

    if (conf().VERBOSE) debug(`Results: ${JSON.stringify(raw, null, 2)}`)

    return raw as {
      [K in keyof typeof queries]: SubstrateEvent[]
    }
  }

  executeQueries<T>(
    queries: {
      [K in keyof T]: GraphQLQuery<T[K]>
    }
  ): Promise<{ [K in keyof T]: (T[K] & AsJson<T[K]>)[] }> {
    const bigNamedQuery = collectNamedQueries(queries)
    // return this.graphClient.request<
    //   { [K in keyof T]: (T[K] & AsJson<T[K]>)[] }
    // >(bigNamedQuery)
    return this.requestSubstrateData<
      { [K in keyof T]: (T[K] & AsJson<T[K]>)[] }
    >(bigNamedQuery)
  }

  async getBlock(blockNumber: number): Promise<SubstrateBlock> {
    const block = this.blockCache.get(blockNumber)
    if (block !== undefined) {
      return block
    }
    debug(`WARNING: block cache miss: ${blockNumber}`)
    await this.fetchBlocks([blockNumber])
    return this.blockCache.get(blockNumber) as SubstrateBlock
  }

  async fetchBlocks(heights: number[]): Promise<SubstrateBlock[]> {
    if (conf().VERBOSE) debug(`Fetching blocks: ${JSON.stringify(heights)}`)

    const cached = compact(heights.map((h) => this.blockCache.get(h)))

    if (conf().VERBOSE) debug(`Cached blocks: ${JSON.stringify(cached)}`)

    const toFetch = heights.filter((h) => this.blockCache.get(h) === undefined)
    if (toFetch.length === 0) {
      debug(`All ${heights.length} blocks are cached.`)
      return cached
    }

    const query: GraphQLQuery<SubstrateBlock> = {
      name: 'substrateBlocks',
      fields: [
        'id',
        'hash',
        'parentHash',
        'height',
        'timestamp',
        'runtimeVersion',
        'lastRuntimeUpgrade',
        { 'events': ['id', 'name', 'extrinsic'] },
        { 'extrinsics': ['id', 'name'] },
      ],
      query: {
        where: {
          height: { in: toFetch },
        },
        orderBy: { asc: 'height' },
        limit: Math.min(toFetch.length, conf().BLOCK_CACHE_CAPACITY),
      },
    }

    const result = await this.executeQueries({
      blocks: query,
    })

    for (const b of result.blocks) {
      this.blockCache.put(b.height, b)
    }

    debug(`Fetched and cached ${result.blocks.length} blocks`)

    return [...cached, ...result.blocks].sort()
  }

  private requestSubstrateData<T>(query: string): Promise<T> {
    // TODO: use timeouts?
    return this.request<T, SubstrateType>(query, REVIVE_SUBSTRATE_FIELDS)
  }

  private async request<T, K>(
    query: string,
    revive: Partial<
      {
        [P in keyof K]: K[P] extends number | BigInt
          ? 'BigInt' | 'Number'
          : never
      }
    >
  ): Promise<T> {
    const raw = await this.graphClient.request<T>(query)
    return JSON.parse(JSON.stringify(raw), (k, v) => {
      if (revive[k as keyof K] === 'BigInt' && typeof v === 'string') {
        return BigInt(v)
      }
      if (revive[k as keyof K] === 'Number' && typeof v === 'string') {
        return Number.parseInt(v)
      }
      return v
    })
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
    event_in.length > 0 ? `name_in: [${quotedJoin(event_in as string[])}],` : ''

  const extrinsic_in = extrinsic ? extrinsic.in || [] : []
  const extrinsicsFilter =
    extrinsic_in.length > 0
      ? `extrinsicName_in: [${quotedJoin(extrinsic_in as string[])}],`
      : ''

  const idFilter = id.gt ? `afterID: "${id.gt}",` : ''

  // FIXME: very rough...
  const block_gt = block.gt || 0
  const block_lte = block.lte || Number.MIN_SAFE_INTEGER

  return `
  substrateEventsAfter(where: { ${eventsFilter}${extrinsicsFilter} blockNumber_gt: ${block_gt}, blockNumber_lte: ${block_lte} }, ${idFilter} limit: ${limit}) {
    id
    name 
    method 
    params {
      name
      type
      value
    }
    indexInBlock 
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
