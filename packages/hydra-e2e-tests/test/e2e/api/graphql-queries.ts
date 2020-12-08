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
