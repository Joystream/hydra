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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToOne = void 0;
require("reflect-metadata");
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var decorators_1 = require("../decorators");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils");
function ManyToOne(parentType, joinFunc, options) {
    if (options === void 0) { options = {}; }
    // Need to grab the class name from within a decorator
    var klass;
    var extractClassName = function (target) {
        klass = target.constructor.name;
    };
    // This Decorator creates the foreign key field for the association so that the consumer
    // Doesn't need to hand roll this each time by doing somethign like:
    // @StringField()
    // userId?: ID;
    var createForeignKeyField = function (target, propertyKey, descriptor) {
        klass = target.constructor.name;
        Reflect.defineProperty(target, klass + "Id", {});
        decorators_1.IdField(options)(target, propertyKey + "Id", descriptor);
    };
    // NOTE: this is unnecessary, but I'm keeping it around because otherwise it will generate the schema properties in a different order
    // It could otherwise safely be deleted
    var graphQLdecorator = [type_graphql_1.Field(parentType, __assign({}, options))];
    // END NOTE
    var factories = __spreadArray(__spreadArray([
        extractClassName
    ], graphQLdecorator), [
        typeorm_1.ManyToOne(parentType, joinFunc, options),
        typeorm_1.JoinColumn(),
        createForeignKeyField
    ]);
    metadata_1.getMetadataStorage().addModelRelation(__assign(__assign({}, options), { isList: false }));
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.ManyToOne = ManyToOne;
//# sourceMappingURL=ManyToOne.js.map