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
exports.IdField = void 0;
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function IdField(options) {
    if (options === void 0) { options = {}; }
    var nullableOption = options.nullable === true ? { nullable: true } : {};
    var uniqueOption = options.unique ? { unique: true } : {};
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'id',
        warthogColumnMeta: options,
        dbColumnOptions: __assign(__assign({}, nullableOption), uniqueOption)
    });
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.IdField = IdField;
//# sourceMappingURL=IdField.js.map