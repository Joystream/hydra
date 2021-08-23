"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONField = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
var GraphQLJSONObject = require('graphql-type-json').GraphQLJSONObject;
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function JSONField(options) {
    var _a;
    if (options === void 0) { options = {}; }
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'json',
        warthogColumnMeta: options,
        gqlFieldType: (_a = options.gqlFieldType) !== null && _a !== void 0 ? _a : GraphQLJSONObject,
        dbType: 'jsonb'
    });
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.JSONField = JSONField;
//# sourceMappingURL=JSONField.js.map