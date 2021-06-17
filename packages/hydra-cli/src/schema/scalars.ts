import gql from 'graphql-tag'

/* eslint-disable @typescript-eslint/naming-convention */

// Supported built-in scalar types and corressponding warthog type
export const availableTypes: {
  [name: string]: string
} = {
  ID: 'string',
  String: 'string',
  Int: 'int',
  Boolean: 'bool',
  DateTime: 'date',
  Float: 'float',
  BigInt: 'numeric',
  BigDecimal: 'decimal',
  Bytes: 'bytes',
}

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
