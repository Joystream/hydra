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
exports.EncodingService = void 0;
var typedi_1 = require("typedi");
var decorators_1 = require("../decorators");
var EncodingService = /** @class */ (function () {
    function EncodingService() {
        this.JSON_MARKER = '__JSON__:';
    }
    EncodingService.prototype.encode64 = function (str) {
        return Buffer.from(str, 'ascii').toString('base64');
    };
    EncodingService.prototype.encode = function (input) {
        return this.encode64(JSON.stringify(input));
    };
    EncodingService.prototype.decode64 = function (str) {
        return Buffer.from(str, 'base64').toString('ascii');
    };
    EncodingService.prototype.decode = function (str) {
        return JSON.parse(this.decode64(str));
    };
    var _a;
    __decorate([
        decorators_1.debug('encoding:decode'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", typeof (_a = typeof T !== "undefined" && T) === "function" ? _a : Object)
    ], EncodingService.prototype, "decode", null);
    EncodingService = __decorate([
        typedi_1.Service()
    ], EncodingService);
    return EncodingService;
}());
exports.EncodingService = EncodingService;
//# sourceMappingURL=encoding.js.map