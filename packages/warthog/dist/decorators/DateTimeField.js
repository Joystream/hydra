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
exports.DateTimeField = void 0;
// https://www.postgresql.org/docs/10/datatype-datetime.html
var type_graphql_1 = require("type-graphql");
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
// V3: Deprecate this usage in favor of DateTimeField
function DateTimeField(options) {
    if (options === void 0) { options = {}; }
    var nullableOption = options.nullable === true ? { nullable: true } : {};
    var defaultOption = options.default ? { default: options.default } : {};
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'datetime',
        warthogColumnMeta: options,
        gqlFieldType: type_graphql_1.GraphQLISODateTime,
        dbType: 'timestamp',
        dbColumnOptions: __assign(__assign({}, nullableOption), defaultOption)
    });
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.DateTimeField = DateTimeField;
//# sourceMappingURL=DateTimeField.js.map