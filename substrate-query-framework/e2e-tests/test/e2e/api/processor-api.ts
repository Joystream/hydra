import { GraphQLClient } from 'graphql-request'
import Container from 'typedi'

const FIND_TRANSFER_BY_VALUE = `
query FindTransferByValue($value: BigInt, $block: Int) {
	transfers(where: { value_eq: $value, block_eq: $block }) {
        value
        to
        from
        block
    }  
}
`

export interface Transfer {
  value: string
  from: string
  to: string
  block: number
}

export async function findTransfersByValue(
  value: Number,
  block: Number
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
