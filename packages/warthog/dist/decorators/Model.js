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
exports.Model = void 0;
var caller = require('caller'); // eslint-disable-line @typescript-eslint/no-var-requires
var path = require("path");
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var metadata_1 = require("../metadata");
var utils_1 = require("../utils/");
// Allow default TypeORM and TypeGraphQL options to be used
function Model(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.api, api = _c === void 0 ? {} : _c, _d = _b.db, db = _d === void 0 ? {} : _d, _e = _b.apiOnly, apiOnly = _e === void 0 ? false : _e, _f = _b.dbOnly, dbOnly = _f === void 0 ? false : _f;
    // In order to use the enums in the generated classes file, we need to
    // save their locations and import them in the generated file
    var modelFileName = caller();
    // V3: Remove these - they're here for backwards compatability so that we don't remove api: false and db: false
    if (api === false) {
        dbOnly = true;
    }
    if (db === false) {
        apiOnly = true;
    }
    var apiOnlyOption = apiOnly === true ? { apiOnly: true } : {};
    var dbOnlyOption = dbOnly === true ? { dbOnly: true } : {};
    // Use relative paths when linking source files so that we can check the generated code in
    // and it will work in any directory structure
    var relativeFilePath = path.relative(utils_1.generatedFolderPath(), modelFileName);
    var registerModelWithWarthog = function (target) {
        // Save off where the model is located so that we can import it in the generated classes
        metadata_1.getMetadataStorage().addModel(target.name, target, relativeFilePath, __assign(__assign({}, apiOnlyOption), dbOnlyOption));
    };
    var factories = [];
    if (!apiOnly) {
        factories.push(typeorm_1.Entity(db));
    }
    // We add our own Warthog decorator regardless of dbOnly and apiOnly
    factories.push(registerModelWithWarthog);
    // We shouldn't add this as it creates the GraphQL type, but there is a
    // bug if we don't add it because we end up adding the Field decorators in the models
    factories.push(type_graphql_1.ObjectType(api));
    return utils_1.composeClassDecorators.apply(void 0, factories);
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map