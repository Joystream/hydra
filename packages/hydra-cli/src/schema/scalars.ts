import gql from 'graphql-tag'

export const scalars = gql`
  scalar ID
  scalar Bytes
  scalar BigInt
  scalar DateTime
  scalar BigDecimal

  # In order to pass graphql validation
  type Query {
    _dummy: String # empty queries are not allowed
  }
`
