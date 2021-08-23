import { GraphQLScalarType } from 'graphql';

const hexValidator = /(0x|0X)?[a-fA-F0-9]+$/;

export const GraphQLBytes = new GraphQLScalarType({
  name: 'Bytes',
  description: 'GraphQL representation of Bytes',
  parseValue(value: string | Buffer) {
    if (typeof value !== 'string' && !(value instanceof Buffer)) {
      throw new TypeError(`Value is not an instance of Buffer: ${JSON.stringify(value)}`);
    }

    if (typeof value === 'string') {
      const isHex = hexValidator.test(value);
      if (!isHex) {
        throw new TypeError(`Value is not a valid hex encoded string: ${JSON.stringify(value)}`);
      }
      return Buffer.from(value, 'hex');
    }

    return value;
  },

  serialize(value: Buffer) {
    return value ? `0x` + value.toString('hex') : value; // value sent to the client
  },
});
