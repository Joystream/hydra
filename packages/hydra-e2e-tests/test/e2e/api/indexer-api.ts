import { GraphQLClient } from 'graphql-request'
import Container from 'typedi'

import {
  GET_INDEXER_HEAD,
  SUBSTRATE_EVENTS_LIMIT_BY_ONE,
} from './graphql-queries'

export async function indexerHead(): Promise<number> {
  const indexerClient = Container.get<GraphQLClient>('IndexerClient')
  const status = await indexerClient.request<{
    indexerStatus: { head: number }
  }>(GET_INDEXER_HEAD)
  return status.indexerStatus.head
}

export async function blockTimestamp(): Promise<number> {
  const indexerClient = Container.get<GraphQLClient>('IndexerClient')
  const event = await indexerClient.request<{
    substrate_event: [{ blockTimestamp: string }]
  }>(SUBSTRATE_EVENTS_LIMIT_BY_ONE)
  return Number.parseInt(event.substrate_event[0].blockTimestamp)
}
