"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLBytes = void 0;
var graphql_1 = require("graphql");
var hexValidator = /(0x|0X)?[a-fA-F0-9]+$/;
exports.GraphQLBytes = new graphql_1.GraphQLScalarType({
    name: 'Bytes',
    description: 'GraphQL representation of Bytes',
    parseValue: function (value) {
        if (typeof value !== 'string' && !(value instanceof Buffer)) {
            throw new TypeError("Value is not an instance of Buffer: " + JSON.stringify(value));
        }
        if (typeof value === 'string') {
            var isHex = hexValidator.test(value);
            if (!isHex) {
                throw new TypeError("Value is not a valid hex encoded string: " + JSON.stringify(value));
            }
            return Buffer.from(value, 'hex');
        }
        return value;
    },
    serialize: function (value) {
        return value ? "0x" + value.toString('hex') : value; // value sent to the client
    }
});
//# sourceMappingURL=GraphQLBytes.js.map