import { GraphQLScalarType } from 'graphql';
import * as BN from 'bn.js';

export const GraphQLBigNumber = new GraphQLScalarType({
  name: 'BigInt',
  description: 'GraphQL representation of BigInt',
  parseValue(value: string | number) {
    return value; // value from the client input variables
  },
  serialize(value: BN) {
    return value ? value.toString() : value; // value sent to the client
  },
});
