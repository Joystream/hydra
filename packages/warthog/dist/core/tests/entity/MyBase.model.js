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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBaseService = exports.MyBase = void 0;
var typedi_1 = require("typedi");
var typeorm_1 = require("typeorm");
var typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
var __1 = require("../../");
var MyBase = /** @class */ (function (_super) {
    __extends(MyBase, _super);
    function MyBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", Boolean)
    ], MyBase.prototype, "registered", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], MyBase.prototype, "firstName", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], MyBase.prototype, "lastName", void 0);
    MyBase = __decorate([
        typeorm_1.Entity()
    ], MyBase);
    return MyBase;
}(__1.BaseModel));
exports.MyBase = MyBase;
var MyBaseService = /** @class */ (function (_super) {
    __extends(MyBaseService, _super);
    function MyBaseService(repository) {
        var _this = _super.call(this, MyBase, repository) || this;
        _this.repository = repository;
        return _this;
    }
    MyBaseService = __decorate([
        typedi_1.Service('MyBaseService'),
        __param(0, typeorm_typedi_extensions_1.InjectRepository(MyBase)),
        __metadata("design:paramtypes", [typeorm_1.Repository])
    ], MyBaseService);
    return MyBaseService;
}(__1.BaseService));
exports.MyBaseService = MyBaseService;
//# sourceMappingURL=MyBase.model.js.map