"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForeignKeyField = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var utils_1 = require("../utils");
// Links two tables within the same DB, so they're joined by the ID columns
function ForeignKeyField() {
    return utils_1.composeMethodDecorators(type_graphql_1.Field(function () { return String; }), typeorm_1.Column());
}
exports.ForeignKeyField = ForeignKeyField;
//# sourceMappingURL=ForeignKeyField.js.map