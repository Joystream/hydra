"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLInfoService = void 0;
// import { GraphQLResolveInfo } from 'graphql';
var graphqlFields = require("graphql-fields");
var typedi_1 = require("typedi");
var GraphQLInfoService = /** @class */ (function () {
    function GraphQLInfoService() {
    }
    GraphQLInfoService.prototype.getFields = function (info) {
        return graphqlFields(info);
    };
    GraphQLInfoService.prototype.connectionOptions = function (fields) {
        var _a, _b, _c, _d;
        if (!fields) {
            return {
                selectFields: [],
                totalCount: false,
                endCursor: false,
                startCursor: '',
                edgeCursors: ''
            };
        }
        return {
            selectFields: this.baseFields((_a = fields === null || fields === void 0 ? void 0 : fields.edges) === null || _a === void 0 ? void 0 : _a.node),
            totalCount: isDefined(fields.totalCount),
            endCursor: isDefined((_b = fields.pageInfo) === null || _b === void 0 ? void 0 : _b.endCursor),
            startCursor: isDefined((_c = fields.pageInfo) === null || _c === void 0 ? void 0 : _c.startCursor),
            edgeCursors: isDefined((_d = fields === null || fields === void 0 ? void 0 : fields.edges) === null || _d === void 0 ? void 0 : _d.cursor)
        };
    };
    GraphQLInfoService.prototype.baseFields = function (node) {
        if (!node) {
            return [];
        }
        var scalars = Object.keys(node).filter(function (item) {
            return Object.keys(node[item]).length === 0;
        });
        return scalars;
    };
    GraphQLInfoService = __decorate([
        typedi_1.Service()
    ], GraphQLInfoService);
    return GraphQLInfoService;
}());
exports.GraphQLInfoService = GraphQLInfoService;
function isDefined(obj) {
    return typeof obj !== 'undefined';
}
//# sourceMappingURL=GraphQLInfoService.js.map