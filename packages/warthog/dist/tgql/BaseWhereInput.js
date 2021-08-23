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
exports.BaseWhereInput = void 0;
var type_graphql_1 = require("type-graphql");
var BaseWhereInput = /** @class */ (function () {
    function BaseWhereInput() {
    }
    __decorate([
        type_graphql_1.Field(function () { return String; }, { nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "id_eq", void 0);
    __decorate([
        type_graphql_1.Field(function () { return [String]; }, { nullable: true }),
        __metadata("design:type", Array)
    ], BaseWhereInput.prototype, "id_in", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "createdAt_eq", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "createdAt_lt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "createdAt_lte", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "createdAt_gt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "createdAt_gte", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "createdById_eq", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "updatedAt_eq", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "updatedAt_lt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "updatedAt_lte", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "updatedAt_gt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "updatedAt_gte", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "updatedById_eq", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", Boolean)
    ], BaseWhereInput.prototype, "deletedAt_all", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "deletedAt_eq", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "deletedAt_lt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "deletedAt_lte", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "deletedAt_gt", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "deletedAt_gte", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], BaseWhereInput.prototype, "deletedById_eq", void 0);
    BaseWhereInput = __decorate([
        type_graphql_1.InputType()
    ], BaseWhereInput);
    return BaseWhereInput;
}());
exports.BaseWhereInput = BaseWhereInput;
//# sourceMappingURL=BaseWhereInput.js.map