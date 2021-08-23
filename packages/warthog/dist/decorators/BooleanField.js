"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanField = void 0;
var graphql_1 = require("graphql");
var utils_1 = require("../utils");
var getCombinedDecorator_1 = require("./getCombinedDecorator");
function BooleanField(options) {
    if (options === void 0) { options = {}; }
    var factories = getCombinedDecorator_1.getCombinedDecorator({
        fieldType: 'boolean',
        warthogColumnMeta: options,
        gqlFieldType: graphql_1.GraphQLBoolean,
        dbType: 'boolean'
    });
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.BooleanField = BooleanField;
//# sourceMappingURL=BooleanField.js.map