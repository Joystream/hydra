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
exports.PaginationArgs = void 0;
// type-graphql is hooked into class-validator: https://github.com/typestack/class-validator
//              so we can have it automatically validate that args coming in are valid
// See https://github.com/typestack/class-validator#validation-decorators for list of decorators
// See https://github.com/typestack/class-validator/tree/master/sample for examples
var class_validator_1 = require("class-validator");
var type_graphql_1 = require("type-graphql");
var PaginationArgs = /** @class */ (function () {
    function PaginationArgs() {
        this.limit = 50;
    }
    __decorate([
        type_graphql_1.Field(function () { return type_graphql_1.Int; }, { nullable: true }),
        class_validator_1.Min(0),
        __metadata("design:type", Number)
    ], PaginationArgs.prototype, "offset", void 0);
    __decorate([
        type_graphql_1.Field(function () { return type_graphql_1.Int; }, { nullable: true }),
        class_validator_1.Min(1),
        __metadata("design:type", Number)
    ], PaginationArgs.prototype, "limit", void 0);
    PaginationArgs = __decorate([
        type_graphql_1.ArgsType()
    ], PaginationArgs);
    return PaginationArgs;
}());
exports.PaginationArgs = PaginationArgs;
//# sourceMappingURL=PaginationArgs.js.map