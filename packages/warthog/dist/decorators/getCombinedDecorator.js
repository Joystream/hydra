"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCombinedDecorator = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var WarthogField_1 = require("./WarthogField");
//
function getCombinedDecorator(_a) {
    var fieldType = _a.fieldType, warthogColumnMeta = _a.warthogColumnMeta, _b = _a.gqlFieldType, gqlFieldType = _b === void 0 ? String : _b, _c = _a.dbType, dbType = _c === void 0 ? 'varchar' : _c, _d = _a.dbColumnOptions, columnOptions = _d === void 0 ? {} : _d;
    var nullableOption = warthogColumnMeta.nullable === true ? { nullable: true } : {};
    var defaultOption = typeof warthogColumnMeta.default !== 'undefined' ? { default: warthogColumnMeta.default } : {};
    var uniqueOption = typeof warthogColumnMeta.unique !== 'undefined' ? { unique: warthogColumnMeta.unique } : {};
    var tgqlDescriptionOption = typeof warthogColumnMeta.description !== 'undefined'
        ? { description: warthogColumnMeta.description }
        : {};
    var arrayOption = warthogColumnMeta.array ? { array: true } : {};
    // TODO: Enable this when TypeORM is fixed: https://github.com/typeorm/typeorm/issues/5906
    // const typeOrmColumnOption =
    //   typeof warthogColumnMeta.description !== 'undefined'
    //     ? { column: warthogColumnMeta.description }
    //     : {};
    var exposeDB = !warthogColumnMeta.apiOnly;
    var exposeAPI = !warthogColumnMeta.dbOnly;
    // Warthog: start with the Warthog decorator that adds metadata for generating the GraphQL schema
    // for sorting, filtering, args, where inputs, etc...
    var decorators = [];
    if (exposeAPI) {
        decorators.push(WarthogField_1.WarthogField(fieldType, warthogColumnMeta));
    }
    // TypeGraphQL: next add the type-graphql decorator that generates the GraphQL type (or field within that type)
    // If an object is only writeable, don't add the `Field` decorators that will add it to the GraphQL type
    if (exposeAPI && !warthogColumnMeta.writeonly) {
        decorators.push(type_graphql_1.Field(function () { return gqlFieldType; }, __assign(__assign(__assign({}, nullableOption), defaultOption), tgqlDescriptionOption)));
    }
    // TypeORM: finally add the TypeORM decorator to describe the DB field
    if (exposeDB) {
        decorators.push(typeorm_1.Column(__assign(__assign(__assign(__assign(__assign({ type: dbType }, nullableOption), defaultOption), columnOptions), uniqueOption), arrayOption
        // ...typeOrmColumnOption: // TODO: Enable this when TypeORM is fixed: https://github.com/typeorm/typeorm/issues/5906
        )));
    }
    return decorators;
}
exports.getCombinedDecorator = getCombinedDecorator;
//# sourceMappingURL=getCombinedDecorator.js.map