"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarthogField = void 0;
var metadata_1 = require("../metadata");
function WarthogField(fieldType, options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey) {
        metadata_1.getMetadataStorage().addField(fieldType, target.constructor.name, propertyKey, options);
    };
}
exports.WarthogField = WarthogField;
//# sourceMappingURL=WarthogField.js.map