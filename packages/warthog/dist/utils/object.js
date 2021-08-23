"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectUtil = void 0;
var string_1 = require("./string");
var ObjectUtil = /** @class */ (function () {
    function ObjectUtil() {
    }
    // Ex: prefixKeys({one: 1}, 'PRE_') => {PRE_one: 1}
    ObjectUtil.prefixKeys = function (obj, prefix) {
        return Object.keys(obj).reduce(function (result, key) {
            result["" + prefix + key] = obj[key];
            return result;
        }, {});
    };
    // Ex: constantizeKeys({helloWorld: 1}) => {HELLO_WORLD: 1}
    ObjectUtil.constantizeKeys = function (obj) {
        return Object.keys(obj).reduce(function (result, key) {
            result[string_1.StringUtil.constantize(key)] = obj[key];
            return result;
        }, {});
    };
    return ObjectUtil;
}());
exports.ObjectUtil = ObjectUtil;
//# sourceMappingURL=object.js.map