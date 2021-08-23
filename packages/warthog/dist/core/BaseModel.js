"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModelUUID = exports.BaseModel = exports.BaseGraphQLObject = void 0;
var shortid = require("shortid");
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
// This interface adds all of the base type-graphql fields to our BaseClass
var BaseGraphQLObject = /** @class */ (function () {
    function BaseGraphQLObject() {
    }
    __decorate([
        type_graphql_1.Field(function () { return type_graphql_1.ID; }),
        __metadata("design:type", String)
    ], BaseGraphQLObject.prototype, "id", void 0);
    __decorate([
        type_graphql_1.Field(),
        __metadata("design:type", Date)
    ], BaseGraphQLObject.prototype, "createdAt", void 0);
    __decorate([
        type_graphql_1.Field(),
        __metadata("design:type", String)
    ], BaseGraphQLObject.prototype, "createdById", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", Date)
    ], BaseGraphQLObject.prototype, "updatedAt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseGraphQLObject.prototype, "updatedById", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", Date)
    ], BaseGraphQLObject.prototype, "deletedAt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseGraphQLObject.prototype, "deletedById", void 0);
    __decorate([
        type_graphql_1.Field(function () { return type_graphql_1.Int; }),
        __metadata("design:type", Number)
    ], BaseGraphQLObject.prototype, "version", void 0);
    BaseGraphQLObject = __decorate([
        type_graphql_1.InterfaceType()
    ], BaseGraphQLObject);
    return BaseGraphQLObject;
}());
exports.BaseGraphQLObject = BaseGraphQLObject;
// This class adds all of the TypeORM decorators needed to create the DB table
var BaseModel = /** @class */ (function () {
    function BaseModel() {
    }
    BaseModel.prototype.getId = function () {
        // If settings allow ID to be specified on create, use the specified ID
        return this.id || shortid.generate();
    };
    // V3: DateTime should use getter to return ISO8601 string
    BaseModel.prototype.getValue = function (field) {
        var self = this;
        if (self[field] instanceof Date) {
            return self[field].toISOString();
        }
        return self[field];
    };
    BaseModel.prototype.setId = function () {
        this.id = this.getId();
    };
    __decorate([
        typeorm_1.PrimaryColumn({ type: String }),
        __metadata("design:type", String)
    ], BaseModel.prototype, "id", void 0);
    __decorate([
        typeorm_1.CreateDateColumn(),
        __metadata("design:type", Date)
    ], BaseModel.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], BaseModel.prototype, "createdById", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({ nullable: true }),
        __metadata("design:type", Date)
    ], BaseModel.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], BaseModel.prototype, "updatedById", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", Date)
    ], BaseModel.prototype, "deletedAt", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], BaseModel.prototype, "deletedById", void 0);
    __decorate([
        typeorm_1.VersionColumn(),
        __metadata("design:type", Number)
    ], BaseModel.prototype, "version", void 0);
    __decorate([
        typeorm_1.BeforeInsert(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], BaseModel.prototype, "setId", null);
    BaseModel = __decorate([
        type_graphql_1.ObjectType({ implements: BaseGraphQLObject })
    ], BaseModel);
    return BaseModel;
}());
exports.BaseModel = BaseModel;
// This class adds all of the TypeORM decorators needed to create the DB table
var BaseModelUUID = /** @class */ (function () {
    function BaseModelUUID() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn('uuid'),
        __metadata("design:type", String)
    ], BaseModelUUID.prototype, "id", void 0);
    __decorate([
        typeorm_1.CreateDateColumn(),
        __metadata("design:type", Date)
    ], BaseModelUUID.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], BaseModelUUID.prototype, "createdById", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({ nullable: true }),
        __metadata("design:type", Date)
    ], BaseModelUUID.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], BaseModelUUID.prototype, "updatedById", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", Date)
    ], BaseModelUUID.prototype, "deletedAt", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], BaseModelUUID.prototype, "deletedById", void 0);
    __decorate([
        typeorm_1.VersionColumn(),
        __metadata("design:type", Number)
    ], BaseModelUUID.prototype, "version", void 0);
    BaseModelUUID = __decorate([
        type_graphql_1.ObjectType({ implements: BaseGraphQLObject })
    ], BaseModelUUID);
    return BaseModelUUID;
}());
exports.BaseModelUUID = BaseModelUUID;
//# sourceMappingURL=BaseModel.js.map