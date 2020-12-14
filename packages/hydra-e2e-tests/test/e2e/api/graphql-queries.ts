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
