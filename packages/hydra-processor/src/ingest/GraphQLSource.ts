import {
  FIFOCache,
  formatEventId,
  SubstrateBlock,
  SubstrateEvent,
  SubstrateExtrinsic,
} from '@subsquid/hydra-common'
import Debug from 'debug'
import { GraphQLClient } from 'graphql-request'
import { compact } from 'lodash'
import { getConfig as conf } from '../start/config'
import { IndexerStatus } from '../state'
import { stringify, quotedJoin } from '../util'
import { IProcessorSource } from './'
import { IndexerQuery } from './IProcessorSource'
import pRetry from 'p-retry'

const debug = Debug('hydra-processor:graphql-source')

type SubstrateType = SubstrateBlock & SubstrateEvent & SubstrateExtrinsic

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
    const status = await this.request<{
      indexerStatus: IndexerStatus
    }>(GET_INDEXER_STATUS)
    return status.indexerStatus as IndexerStatus
  }

  async nextBatch<T>(
    queries: {
      [K in keyof T]: IndexerQuery
    }
  ): Promise<{ [K in keyof typeof queries]: SubstrateEvent[] }> {
    if (conf().VERBOSE)
      debug(`Next batch queries: ${JSON.stringify(queries, null, 2)}`)

    const query = collectQueries(queries)

    const raw = await this.requestSubstrateData<
      { [K in keyof typeof queries]: SubstrateEvent[] }
    >(query)

    debug(
      `Fetched ${Object.keys(raw).reduce(
        (total, k) => total + raw[k as keyof typeof raw].length,
        0
      )} events`
    )

    return raw as {
      [K in keyof typeof queries]: SubstrateEvent[]
    }
  }

  // Commenting out for now, as it is not essential
  // executeQueries<T>(
  //   queries: {
  //     [K in keyof T]: GraphQLQuery<T[K]>
  //   }
  // ): Promise<{ [K in keyof T]: (T[K] & AsJson<T[K]>)[] }> {
  //   const bigNamedQuery = collectNamedQueries(queries)
  //   // return this.graphClient.request<
  //   //   { [K in keyof T]: (T[K] & AsJson<T[K]>)[] }
  //   // >(bigNamedQuery)
  //   return this.requestSubstrateData<
  //     { [K in keyof T]: (T[K] & AsJson<T[K]>)[] }
  //   >(bigNamedQuery)
  // }

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
    if (conf().VERBOSE) debug(`Fetching blocks: ${stringify(heights)}`)

    const cached = compact(heights.map((h) => this.blockCache.get(h)))

    if (conf().VERBOSE) debug(`Cached blocks: ${stringify(cached)}`)

    const toFetch = heights.filter((h) => this.blockCache.get(h) === undefined)
    if (toFetch.length === 0) {
      debug(`All ${heights.length} blocks are cached.`)
      return cached
    }

    const limit = Math.min(toFetch.length, conf().BLOCK_CACHE_CAPACITY)

    const result = await this.requestSubstrateData<{
      blocks: SubstrateBlock[]
    }>(`{
      blocks: substrate_block(where: {height: {_in: [${toFetch.join(
        ','
      )}]}}, order_by: {height: asc}, limit: ${limit}) {
        id
        hash
        parentHash
        height
        timestamp
        runtimeVersion
        lastRuntimeUpgrade
        events
        extrinsics
    }}`)

    for (const b of result.blocks) {
      this.blockCache.put(b.height, b)
    }

    debug(`Fetched and cached ${result.blocks.length} blocks`)

    return [...cached, ...result.blocks].sort((a, b) => a.height - b.height)
  }

  private requestSubstrateData<T>(query: string): Promise<T> {
    // TODO: use timeouts?
    if (conf().VERBOSE) debug(`GraphqQL Query: ${query}`)

    return this.request<T, SubstrateType>(query, REVIVE_SUBSTRATE_FIELDS)
  }

  private async request<T, K = unknown>(
    query: string,
    revive: Partial<
      {
        [P in keyof K]: K[P] extends number | BigInt
          ? 'BigInt' | 'Number'
          : never
      }
    > = {}
  ): Promise<T> {
    const raw = await pRetry(() => this.graphClient.request<T>(query), {
      retries: conf().INDEXER_CALL_RETRIES,
      onFailedAttempt: (i) => {
        debug(
          `Failed to connect to the indexer endpoint "${
            conf().INDEXER_ENDPOINT_URL
          }" after ${i.attemptNumber} attempts: ${i.message}. Stack: ${
            i.stack
          }. Retries left: ${i.retriesLeft}`
        )
      },
    })

    const revived = JSON.parse(JSON.stringify(raw), (k, v) => {
      if (revive[k as keyof K] === 'BigInt' && typeof v === 'string') {
        return BigInt(v)
      }
      if (revive[k as keyof K] === 'Number' && typeof v === 'string') {
        return Number.parseInt(v)
      }
      return v
    })

    if (conf().VERBOSE) debug(`Results: ${stringify(revived)}`)

    return revived
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
    event_in.length > 0
      ? `name: {_in: [${quotedJoin(event_in as string[])}]},`
      : ''

  const extrinsic_in = extrinsic ? extrinsic.in || [] : []
  const extrinsicsFilter =
    extrinsic_in.length > 0
      ? `extrinsic: {name: {_in: [${quotedJoin(extrinsic_in as string[])}]}},`
      : ''

  return `
  substrate_event(where: { ${eventsFilter}${extrinsicsFilter}${getIdFilter({
    id,
    block,
  })} }, limit: ${limit}, order_by: {id: asc}) {
    id
    name
    section
    method
    params
    indexInBlock
    blockNumber
    blockTimestamp
    extrinsic {
      id
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

export function getIdFilter(input: {
  id: { gt?: string | number }
  block: { gt?: string | number; lte?: string | number }
}): string {
  const block_gt = input.block.gt !== undefined ? Number(input.block.gt) : 0

  const block_gt_id_filter: string = formatEventId(block_gt, 0)

  const block_lte_id_filter: string =
    input.block.lte !== undefined
      ? `, _lt: "${formatEventId(Number(input.block.lte) + 1, 0)}"`
      : ''

  const id_gt_filter: string =
    input.id.gt !== undefined ? String(input.id.gt) : formatEventId(0, 0) // we should always have something

  return `id: { _gt: "${
    block_gt_id_filter > id_gt_filter ? block_gt_id_filter : id_gt_filter
  }"${block_lte_id_filter} }`
}
