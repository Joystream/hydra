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
exports.OneToMany = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils");
function OneToMany(parentType, joinFunc, options) {
    if (options === void 0) { options = {}; }
    var factories = [
        type_graphql_1.Field(parentType, __assign({}, options)),
        typeorm_1.OneToMany(parentType, joinFunc)
    ];
    metadata_1.getMetadataStorage().addModelRelation(__assign(__assign({}, options), { isList: true }));
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.OneToMany = OneToMany;
//# sourceMappingURL=OneToMany.js.map