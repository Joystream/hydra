import { GraphQLClient } from 'graphql-request'
import Container from 'typedi'

import {
  FTS_COMMENT_QUERY,
  FIND_TRANSFER_BY_VALUE,
  FETCH_INSERTED_AT_FIELD_FROM_TRANSFER,
} from './graphql-queries'

export interface Transfer {
  value: string
  from: string
  to: string
  block: number
}

export async function findTransfersByComment(text: string): Promise<string[]> {
  const graphClient = Container.get<GraphQLClient>('ProcessorClient')

  const result = await graphClient.request<{
    commentSearch: {
      highlight: string
    }[]
  }>(FTS_COMMENT_QUERY, { text })

  return result.commentSearch.map((c) => c.highlight)
}

export async function findTransfersByValue(
  value: number,
  block: number
): Promise<Transfer[]> {
  const graphClient = Container.get<GraphQLClient>('ProcessorClient')

  const result = await graphClient.request<{
    transfers: {
      value: string
      from: string
      to: string
      block: number
    }[]
  }>(FIND_TRANSFER_BY_VALUE, { value: value.toString(), block })

  return result.transfers
}

export async function fetchDateTimeFieldFromTransfer(): Promise<Date> {
  const graphClient = Container.get<GraphQLClient>('ProcessorClient')
  const result = await graphClient.request<{
    transfers: {
      insertedAt: string
    }[]
  }>(FETCH_INSERTED_AT_FIELD_FROM_TRANSFER)

  return new Date(result.transfers[0].insertedAt)
}
