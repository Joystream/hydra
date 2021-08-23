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
exports.PageInfo = void 0;
var type_graphql_1 = require("type-graphql");
var PageInfo = /** @class */ (function () {
    function PageInfo() {
    }
    __decorate([
        type_graphql_1.Field({ nullable: false }),
        __metadata("design:type", Boolean)
    ], PageInfo.prototype, "hasNextPage", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: false }),
        __metadata("design:type", Boolean)
    ], PageInfo.prototype, "hasPreviousPage", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], PageInfo.prototype, "startCursor", void 0);
    __decorate([
        type_graphql_1.Field({ nullable: true }),
        __metadata("design:type", String)
    ], PageInfo.prototype, "endCursor", void 0);
    PageInfo = __decorate([
        type_graphql_1.ObjectType()
    ], PageInfo);
    return PageInfo;
}());
exports.PageInfo = PageInfo;
//# sourceMappingURL=PageInfo.js.map