import * as BN from 'bn.js'
import { GraphQLScalarType } from 'graphql'

export const GraphQLBigNumber = new GraphQLScalarType({
  name: 'BigNumber',
  description: 'GraphQL representation of BigNumber',

  parseValue(value: string) {
    return new BN(value, 10) // value from the client input variables
  },

  serialize(value: BN) {
    return value ? value.toString(10) : null // value sent to the client
  },
})
