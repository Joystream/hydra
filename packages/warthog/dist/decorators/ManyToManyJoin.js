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
exports.ManyToManyJoin = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils");
// Note: for many to many relationships, you need to set one item as the "JoinTable"
// therefore, we have 2 separate decorators.  Just make sure to add one to one table and
// One to the other in the relationship
function ManyToManyJoin(parentType, joinFunc, options) {
    if (options === void 0) { options = {}; }
    var factories = [
        typeorm_1.JoinTable(),
        type_graphql_1.Field(function () { return [parentType()]; }, __assign({}, options)),
        typeorm_1.ManyToMany(parentType, joinFunc, options)
    ];
    metadata_1.getMetadataStorage().addModelRelation(__assign(__assign({}, options), { isList: true }));
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.ManyToManyJoin = ManyToManyJoin;
//# sourceMappingURL=ManyToManyJoin.js.map