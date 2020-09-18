import * as BN from 'bn.js'
import { GraphQLScalarType } from 'graphql'

export const GraphQLBigNumber = new GraphQLScalarType({
  name: 'BigNumber',
  description: 'GraphQL representation of BigNumber',
  parseValue(value: string) {
    return new BN(value) // value from the client input variables
  },
  serialize(value: BN) {
    return value ? value.toString() : '' // value sent to the client
  },
})
