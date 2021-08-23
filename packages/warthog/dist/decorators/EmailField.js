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
exports.EmailField = void 0;
var class_validator_1 = require("class-validator");
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function EmailField(options) {
    if (options === void 0) { options = {}; }
    var optionsWithDefaults = __assign({ unique: true }, options);
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'email',
        warthogColumnMeta: optionsWithDefaults
    });
    // Adds email validation
    factories.push(class_validator_1.IsEmail());
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.EmailField = EmailField;
//# sourceMappingURL=EmailField.js.map