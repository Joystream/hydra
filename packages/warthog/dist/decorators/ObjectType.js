"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectType = void 0;
var caller = require('caller'); // eslint-disable-line @typescript-eslint/no-var-requires
var path = require("path");
var type_graphql_1 = require("type-graphql");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils/");
// Allow default TypeORM and TypeGraphQL options to be used
// export function Model({ api = {}, db = {}, apiOnly = false, dbOnly = false }: ModelOptions = {}) {
function ObjectType(options) {
    if (options === void 0) { options = {}; }
    // In order to use the enums in the generated classes file, we need to
    // save their locations and import them in the generated file
    var modelFileName = caller();
    // Use relative paths when linking source files so that we can check the generated code in
    // and it will work in any directory structure
    var relativeFilePath = path.relative(utils_1.generatedFolderPath(), modelFileName);
    var registerModelWithWarthog = function (target) {
        // Save off where the model is located so that we can import it in the generated classes
        metadata_1.getMetadataStorage().addClass(target.name, target, relativeFilePath);
    };
    var factories = [];
    // We add our own Warthog decorator regardless of dbOnly and apiOnly
    factories.push(registerModelWithWarthog);
    // We shouldn't add this as it creates the GraphQL type, but there is a
    // bug if we don't add it because we end up adding the Field decorators in the models
    factories.push(type_graphql_1.ObjectType(options));
    return utils_1.composeClassDecorators.apply(void 0, factories);
}
exports.ObjectType = ObjectType;
//# sourceMappingURL=ObjectType.js.map