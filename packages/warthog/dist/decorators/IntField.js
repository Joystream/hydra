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
exports.IntField = void 0;
var type_graphql_1 = require("type-graphql");
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function IntField(options) {
    var _a;
    if (options === void 0) { options = {}; }
    var defaultOption = options.default ? { default: options.default } : {};
    var nullableOption = options.nullable === true ? { nullable: true } : {};
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'integer',
        warthogColumnMeta: options,
        gqlFieldType: type_graphql_1.Int,
        dbType: (_a = options.dataType) !== null && _a !== void 0 ? _a : 'int',
        dbColumnOptions: __assign(__assign({}, nullableOption), defaultOption)
    });
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.IntField = IntField;
//# sourceMappingURL=IntField.js.map