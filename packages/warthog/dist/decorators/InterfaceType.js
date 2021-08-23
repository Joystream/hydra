"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceType = void 0;
var type_graphql_1 = require("type-graphql");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils/");
function InterfaceType(options) {
    if (options === void 0) { options = {}; }
    // Need to set as "any" here as we're dealing with abstract classes that are not newable,
    // So we can't define this as "ClassType"
    var registerWithWarthog = function (target) {
        metadata_1.getMetadataStorage().addInterfaceType(target.name);
    };
    var factories = [
        type_graphql_1.InterfaceType(options),
        registerWithWarthog
    ];
    return utils_1.composeClassDecorators.apply(void 0, factories);
}
exports.InterfaceType = InterfaceType;
//# sourceMappingURL=InterfaceType.js.map