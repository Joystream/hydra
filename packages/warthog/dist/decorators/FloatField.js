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
exports.FloatField = void 0;
var type_graphql_1 = require("type-graphql");
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function FloatField(options) {
    var _a;
    if (options === void 0) { options = {}; }
    var nullableOption = options.nullable === true ? { nullable: true } : {};
    var defaultOption = options.default ? { default: options.default } : {};
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'float',
        warthogColumnMeta: options,
        gqlFieldType: type_graphql_1.Float,
        dbType: (_a = options.dataType) !== null && _a !== void 0 ? _a : 'float8',
        dbColumnOptions: __assign(__assign({}, nullableOption), defaultOption)
    });
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.FloatField = FloatField;
//# sourceMappingURL=FloatField.js.map