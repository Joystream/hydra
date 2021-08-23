"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnakeNamingStrategy = void 0;
var typeorm_1 = require("typeorm");
var StringUtils_1 = require("typeorm/util/StringUtils");
var SnakeNamingStrategy = /** @class */ (function (_super) {
    __extends(SnakeNamingStrategy, _super);
    function SnakeNamingStrategy() {
        return _super.call(this) || this;
    }
    SnakeNamingStrategy.prototype.tableName = function (className, customName) {
        return customName ? customName : StringUtils_1.snakeCase(className) + "s";
    };
    SnakeNamingStrategy.prototype.columnName = function (propertyName, customName, embeddedPrefixes) {
        if (embeddedPrefixes === void 0) { embeddedPrefixes = []; }
        return (StringUtils_1.snakeCase(embeddedPrefixes.join('_')) + (customName ? customName : StringUtils_1.snakeCase(propertyName)));
    };
    SnakeNamingStrategy.prototype.relationName = function (propertyName) {
        return StringUtils_1.snakeCase(propertyName);
    };
    SnakeNamingStrategy.prototype.joinColumnName = function (relationName, referencedColumnName) {
        return StringUtils_1.snakeCase(relationName + "_" + referencedColumnName);
    };
    SnakeNamingStrategy.prototype.joinTableName = function (firstTableName, secondTableName) {
        return StringUtils_1.snakeCase(firstTableName + "_" + secondTableName);
    };
    SnakeNamingStrategy.prototype.joinTableColumnName = function (tableName, propertyName, columnName) {
        return StringUtils_1.snakeCase(tableName + "_" + (columnName ? columnName : propertyName));
    };
    SnakeNamingStrategy.prototype.classTableInheritanceParentColumnName = function (parentTableName, parentTableIdPropertyName) {
        return StringUtils_1.snakeCase(parentTableName + "_" + parentTableIdPropertyName);
    };
    return SnakeNamingStrategy;
}(typeorm_1.DefaultNamingStrategy));
exports.SnakeNamingStrategy = SnakeNamingStrategy;
//# sourceMappingURL=SnakeNamingStrategy.js.map