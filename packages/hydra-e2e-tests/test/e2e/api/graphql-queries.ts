import { gql } from 'graphql-request'

// to be replaced with a ws subsription
export const GET_INDEXER_HEAD = `
query {
  indexerStatus {
    head
  }
}
`

export const SUBSTRATE_EVENTS_LIMIT_BY_ONE = `
query {
  substrateEvents(limit: 1) {
    blockTimestamp
  }
}
`

export const FIND_TRANSFER_BY_VALUE = `
query FindTransferByValue($value: BigInt, $block: Int) {
	transfers(where: { value_eq: $value, block_eq: $block }) {
        value
        to
        from
        block
    }  
}
`

export const ACCOUNTS_BY_VALUE_GT_SOME = `
query accountsByValueGtSome($value: BigInt) {
	accounts(where: { outgoingTx_some: { value_gt:  $value } }) {
    id
  }
}
`

export const ACCOUNTS_BY_VALUE_GT_EVERY = `
query accountsByValueGtEvery($value: BigInt) {
	accounts(where: { outgoingTx_every: { value_gt:  $value } }) {
    id
  }
}
`

export const ACCOUNTS_BY_VALUE_GT_NONE = `
query accountsByValueGtNone($value: BigInt) {
	accounts(where: { outgoingTx_none: { value_gt:  $value } }) {
    id
  }
}
`

export const FTS_COMMENT_QUERY = `
query Search($text: String!) {
  commentSearch(text: $text) {
    highlight
  }
}
`

export const FETCH_INSERTED_AT_FIELD_FROM_TRANSFER = `
query {
	transfers(limit: 1) {
    insertedAt
  }  
}
`

export const FTS_COMMENT_QUERY_WITH_WHERE_CONDITION = gql`
  query Search($text: String!, $skip: Int, $from: Bytes!) {
    commentSearch(text: $text, skip: $skip, whereTransfer: { from_eq: $from }) {
      highlight
      rank
    }
  }
`

export const LAST_BLOCK_TIMESTAMP = `
query {
  blockTimestamps(limit: 1, orderBy: blockNumber_DESC ) {
    timestamp
  }
}
`

export const INTERFACE_TYPES_WITH_RELATIONSHIP = gql`
  query InterfaceQuery {
    events {
      indexInBlock
      ... on BoughtMemberEvent {
        inExtrinsic {
          id
          hash
        }
      }
    }
  }
`

export const PROCESSOR_SUBSCRIPTION = gql`
  subscription {
    stateSubscription {
      indexerHead
      chainHead
      lastProcessedEvent
      lastCompleteBlock
    }
  }
`

export const HOOKS = gql`
  query {
    blockHooks {
      blockNumber
      type
    }
  }
`

export const INTERFACES_FILTERING_BY_ENUM = gql`
  query InterfaceQuery {
    events(where: { type_in: [BoughtMemberEvent] }) {
      indexInBlock
    }
  }
`
