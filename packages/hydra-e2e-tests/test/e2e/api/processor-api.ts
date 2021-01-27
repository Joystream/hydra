import { GraphQLClient } from 'graphql-request'
import Container from 'typedi'

import {
  FTS_COMMENT_QUERY,
  FIND_TRANSFER_BY_VALUE,
  FETCH_INSERTED_AT_FIELD_FROM_TRANSFER,
  FTS_COMMENT_QUERY_WITH_WHERE_CONDITION,
} from './graphql-queries'

export interface Transfer {
  value: string
  from: string
  to: string
  block: number
}

const getGQLClient = () => Container.get<GraphQLClient>('ProcessorClient')

export async function findTransfersByComment(text: string): Promise<string[]> {
  const result = await getGQLClient().request<{
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
  const result = await getGQLClient().request<{
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
  const result = await getGQLClient().request<{
    transfers: {
      insertedAt: string
    }[]
  }>(FETCH_INSERTED_AT_FIELD_FROM_TRANSFER)

  return new Date(result.transfers[0].insertedAt)
}

export async function findTransfersByCommentAndWhereCondition(
  text: string,
  from: string,
  skip = 0
): Promise<
  {
    highlight: string
    rank: number
  }[]
> {
  const result = await getGQLClient().request<{
    commentSearch: {
      highlight: string
      rank: number
    }[]
  }>(FTS_COMMENT_QUERY_WITH_WHERE_CONDITION, { text, skip, from })
  return result.commentSearch
}
