"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtil = void 0;
var StringUtil = /** @class */ (function () {
    function StringUtil() {
    }
    // Ex: HelloWorld -> HELLO_WORLD
    StringUtil.constantize = function (str) {
        return (str
            .split(/([A-Z][a-z]+|[a-z]+)/)
            // This will return some empty strings that need to be filtered
            .filter(function (item) {
            return item.length > 0;
        })
            .join('_')
            .toUpperCase());
    };
    return StringUtil;
}());
exports.StringUtil = StringUtil;
//# sourceMappingURL=string.js.map