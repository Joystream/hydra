"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnToTypeScriptType = exports.columnToGraphQLDataType = exports.columnTypeToGraphQLType = exports.columnToGraphQLType = void 0;
var graphql_scalars_1 = require("graphql-scalars");
var graphql_1 = require("graphql");
var type_graphql_1 = require("type-graphql");
var GraphQLBigNumber_1 = require("../tgql/GraphQLBigNumber");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var GraphQLJSONObject = require('graphql-type-json').GraphQLJSONObject;
var tgql_1 = require("../tgql");
// TODO: need to figure out how to type a custom GraphQLField type
function columnToGraphQLType(column) {
    if (typeof column.enumName !== undefined && column.enumName) {
        return String(column.enumName);
    }
    if (column.type === 'json' && typeof column.gqlFieldType !== 'undefined') {
        return column.gqlFieldType;
    }
    return columnTypeToGraphQLType(column.type);
}
exports.columnToGraphQLType = columnToGraphQLType;
function columnTypeToGraphQLType(type) {
    switch (type) {
        case 'id':
            return graphql_1.GraphQLID;
        case 'email':
        case 'string':
            return graphql_1.GraphQLString;
        case 'boolean':
            return graphql_1.GraphQLBoolean;
        case 'float':
            return graphql_1.GraphQLFloat;
        case 'numeric':
            return GraphQLBigNumber_1.GraphQLBigNumber;
        case 'bytea':
            return tgql_1.Bytes;
        case 'integer':
            return graphql_1.GraphQLInt;
        case 'date':
            return type_graphql_1.GraphQLISODateTime;
        case 'datetime':
            return type_graphql_1.GraphQLISODateTime;
        case 'dateonly':
            return graphql_scalars_1.DateResolver;
        case 'json':
            return GraphQLJSONObject;
        case 'enum':
            // This is to make TS happy and so that we'll get a compile time error if a new type is added
            throw new Error("Will never get here because it's handled above");
    }
}
exports.columnTypeToGraphQLType = columnTypeToGraphQLType;
function columnToGraphQLDataType(column) {
    var graphQLType = columnToGraphQLType(column);
    // Sometimes we want to return the full blow GraphQL data type, but sometimes we want to return
    // the more readable name.  Ex:
    // GraphQLInt -> Int
    // GraphQLJSONObject -> GraphQLJSONObject
    switch (graphQLType) {
        case GraphQLJSONObject:
            return 'GraphQLJSONObject';
        default:
            return typeof graphQLType === 'string' ? graphQLType : graphQLType.name;
    }
}
exports.columnToGraphQLDataType = columnToGraphQLDataType;
function columnToTypeScriptType(column) {
    // TODO: clean this up.  Ideally we'd deduce the TS type from the GraphQL type
    if (column.type === 'json' && typeof column.gqlFieldType !== 'undefined') {
        return column.gqlFieldType.name;
    }
    if (column.type === 'id') {
        return 'string'; // TODO: should this be ID_TYPE?
    }
    else if (column.type === 'dateonly') {
        return 'DateOnlyString';
    }
    else if (column.type === 'datetime') {
        return 'DateTimeString';
    }
    else if (column.enumName) {
        return String(column.enumName);
    }
    else {
        var graphqlType = columnToGraphQLDataType(column);
        var typeMap = {
            Boolean: 'boolean',
            DateTime: 'Date',
            Float: 'number',
            GraphQLJSONObject: 'JsonObject',
            ID: 'string',
            Int: 'number',
            String: 'string'
        };
        return typeMap[graphqlType] || 'string';
    }
}
exports.columnToTypeScriptType = columnToTypeScriptType;
//# sourceMappingURL=type-conversion.js.map