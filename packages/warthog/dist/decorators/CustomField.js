"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomField = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var schema_1 = require("../schema");
var utils_1 = require("../utils");
var WarthogField_1 = require("./WarthogField");
function CustomField(args) {
    // const nullableOption = typeof args.nullable !== 'undefined' ? { nullable: args.nullable } : {};
    // const dbOptions = { ...nullableOption, ...(args.db || {}) };
    var _a = args.api, type = _a.type, filter = _a.filter, sort = _a.sort, readonly = _a.readonly, apiOnly = _a.apiOnly, editable = _a.editable, dbOnly = _a.dbOnly, writeonly = _a.writeonly, typeGraphQLOptions = __rest(_a, ["type", "filter", "sort", "readonly", "apiOnly", "editable", "dbOnly", "writeonly"]);
    var warthogOptions = {
        nullable: args.api.nullable,
        type: type,
        filter: filter,
        sort: sort,
        array: args.db.array,
        readonly: readonly,
        apiOnly: apiOnly,
        editable: editable,
        dbOnly: dbOnly,
        writeonly: writeonly
    };
    var graphQLType = args.db.array
        ? [schema_1.columnTypeToGraphQLType(args.api.type)]
        : schema_1.columnTypeToGraphQLType(args.api.type);
    var factories = [];
    var exposeDB = dbOnly || !apiOnly;
    var exposeAPI = apiOnly || !dbOnly;
    // Warthog: start with the Warthog decorator that adds metadata for generating the GraphQL schema
    // for sorting, filtering, args, where inputs, etc...
    if (exposeAPI) {
        // filter out null and undefined from the list so they get proper defaults
        var filteredOptions = Object.entries(warthogOptions).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            return (v == null ? a : ((a[k] = v), a));
        }, {});
        factories.push(WarthogField_1.WarthogField(type, filteredOptions));
    }
    // TypeGraphQL: next add the type-graphql decorator that generates the GraphQL type (or field within that type)
    // If an object is only writeable, don't add the `Field` decorators that will add it to the GraphQL type
    if (exposeAPI && !warthogOptions.writeonly) {
        factories.push(type_graphql_1.Field(function () { return graphQLType; }, typeGraphQLOptions));
    }
    // TypeORM: finally add the TypeORM decorator to describe the DB field
    if (exposeDB) {
        factories.push(typeorm_1.Column(args.db));
    }
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.CustomField = CustomField;
//# sourceMappingURL=CustomField.js.map