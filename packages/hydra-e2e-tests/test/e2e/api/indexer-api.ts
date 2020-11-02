import { GraphQLClient } from 'graphql-request'
import Container from 'typedi'

// to be replaced with a ws subsription
const GET_INDEXER_HEAD = `
query {
  indexerStatus {
    head
  }
}
`

export async function indexerHead(): Promise<number> {
  const indexerClient = Container.get<GraphQLClient>('IndexerClient')
  const status = await indexerClient.request<{
    indexerStatus: { head: number }
  }>(GET_INDEXER_HEAD)
  return status.indexerStatus.head
}
