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
exports.EnumField = void 0;
var caller = require('caller'); // eslint-disable-line @typescript-eslint/no-var-requires
var path = require("path");
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils");
function EnumField(name, enumeration, options) {
    if (options === void 0) { options = {}; }
    // Register enum with TypeGraphQL so that it lands in generated schema
    type_graphql_1.registerEnumType(enumeration, { name: name });
    // In order to use the enums in the generated classes file, we need to
    // save their locations and import them in the generated file
    var decoratorSourceFile = caller();
    // Use relative paths in the source files so that they can be used on different machines
    var relativeFilePath = path.relative(utils_1.generatedFolderPath(), decoratorSourceFile);
    var registerWithWarthog = function (target, propertyKey) {
        metadata_1.getMetadataStorage().addEnum(target.constructor.name, propertyKey, name, enumeration, relativeFilePath, options);
    };
    var factories = [
        registerWithWarthog,
        type_graphql_1.Field(function () { return enumeration; }, options),
        typeorm_1.Column(__assign({ enum: enumeration }, options))
    ];
    return utils_1.composeMethodDecorators.apply(void 0, factories);
}
exports.EnumField = EnumField;
//# sourceMappingURL=EnumField.js.map