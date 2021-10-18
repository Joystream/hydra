import { GqlClient } from './gql-client'

export const indexer = new GqlClient(
  'http://hydra-indexer-gateway:8087/v1/graphql'
)

export async function indexerHead(): Promise<number> {
  const status = await indexer.query(`
    query {
      indexerStatus {
        head
      }
    }
  `)
  return status.indexerStatus.head
}
