"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLBigNumber = void 0;
var graphql_1 = require("graphql");
exports.GraphQLBigNumber = new graphql_1.GraphQLScalarType({
    name: 'BigInt',
    description: 'GraphQL representation of BigInt',
    parseValue: function (value) {
        return value; // value from the client input variables
    },
    serialize: function (value) {
        return value ? value.toString() : value; // value sent to the client
    }
});
//# sourceMappingURL=GraphQLBigNumber.js.map