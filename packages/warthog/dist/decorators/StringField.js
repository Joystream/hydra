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
exports.StringField = void 0;
var class_validator_1 = require("class-validator");
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function StringField(options) {
    if (options === void 0) { options = {}; }
    var maxLenOption = options.maxLength ? { length: options.maxLength } : {};
    var uniqueOption = options.unique ? { unique: true } : {};
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'string',
        warthogColumnMeta: options,
        gqlFieldType: String,
        dbType: options.dataType || 'varchar',
        dbColumnOptions: __assign(__assign({}, maxLenOption), uniqueOption)
    });
    if (options.minLength) {
        factories.push(class_validator_1.MinLength(options.minLength));
    }
    if (options.maxLength) {
        factories.push(class_validator_1.MaxLength(options.maxLength));
    }
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.StringField = StringField;
//# sourceMappingURL=StringField.js.map