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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
var class_validator_1 = require("class-validator");
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var decorators_1 = require("../decorators");
var torm_1 = require("../torm");
var GraphQLInfoService_1 = require("./GraphQLInfoService");
var RelayService_1 = require("./RelayService");
function isLastBefore(pageType) {
    return pageType.last !== undefined;
}
var BaseService = /** @class */ (function () {
    // TODO: any -> ObjectType<E> (or something close)
    // V3: Only ask for entityClass, we can get repository and manager from that
    function BaseService(entityClass, repository) {
        var _this = this;
        this.entityClass = entityClass;
        this.repository = repository;
        this.attrsToDBColumns = function (attrs) {
            return attrs.map(_this.attrToDBColumn);
        };
        this.attrToDBColumn = function (attr) {
            return "\"" + _this.klass + "\".\"" + _this.columnMap[attr] + "\"";
        };
        if (!entityClass) {
            throw new Error('BaseService requires an entity Class');
        }
        // TODO: use DI
        this.relayService = new RelayService_1.RelayService();
        this.graphQLInfoService = new GraphQLInfoService_1.GraphQLInfoService();
        // V3: remove the need to inject a repository, we simply need the entityClass and then we can do
        // everything we need to do.
        // For now, we'll keep the API the same so that there are no breaking changes
        this.manager = this.repository.manager;
        // TODO: This handles an issue with typeorm-typedi-extensions where it is unable to
        // Inject the proper repository
        if (!repository) {
            this.repository = typeorm_1.getRepository(entityClass);
        }
        if (!repository) {
            throw new Error("BaseService requires a valid repository, class " + entityClass);
        }
        // Need a mapping of camelCase field name to the modified case using the naming strategy.  For the standard
        // SnakeNamingStrategy this would be something like { id: 'id', stringField: 'string_field' }
        this.columnMap = this.repository.metadata.columns.reduce(function (prev, column) {
            prev[column.propertyPath] = column.databasePath;
            return prev;
        }, {});
        this.klass = this.repository.metadata.name.toLowerCase();
    }
    BaseService.prototype.getQueryBuilder = function (where, // V3: WhereExpression = {},
    orderBy, limit, offset, fields, options) {
        // TODO: FEATURE - make the default limit configurable
        limit = limit !== null && limit !== void 0 ? limit : 20;
        return this.buildFindQuery(where, orderBy, { limit: limit, offset: offset }, fields, options);
    };
    BaseService.prototype.find = function (where, // V3: WhereExpression = {},
    orderBy, limit, offset, fields, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: FEATURE - make the default limit configurable
                limit = limit !== null && limit !== void 0 ? limit : 20;
                return [2 /*return*/, this.buildFindQuery(where, orderBy, { limit: limit, offset: offset }, fields, options).getMany()];
            });
        });
    };
    BaseService.prototype.findConnection = function (whereUserInput, // V3: WhereExpression = {},
    orderBy, _pageOptions, fields, options) {
        if (whereUserInput === void 0) { whereUserInput = {}; }
        if (_pageOptions === void 0) { _pageOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var DEFAULT_LIMIT, first, after, last, before, relayPageOptions, limit, cursor, requestedFields, sorts, whereFromCursor, whereCombined, qb, totalCountOption, rawData, returnData;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        DEFAULT_LIMIT = 50;
                        first = _pageOptions.first, after = _pageOptions.after, last = _pageOptions.last, before = _pageOptions.before;
                        if (isLastBefore(_pageOptions)) {
                            limit = last || DEFAULT_LIMIT;
                            cursor = before;
                            relayPageOptions = {
                                last: limit,
                                before: before
                            };
                        }
                        else {
                            limit = first || DEFAULT_LIMIT;
                            cursor = after;
                            relayPageOptions = {
                                first: limit,
                                after: after
                            };
                        }
                        requestedFields = this.graphQLInfoService.connectionOptions(fields);
                        sorts = this.relayService.normalizeSort(orderBy);
                        whereFromCursor = {};
                        if (cursor) {
                            whereFromCursor = this.relayService.getFilters(orderBy, relayPageOptions);
                        }
                        whereCombined = { AND: [whereUserInput, whereFromCursor] };
                        qb = this.buildFindQuery(whereCombined, this.relayService.effectiveOrderStrings(sorts, relayPageOptions), { limit: limit + 1 }, // We ask for 1 too many so that we know if there is an additional page
                        requestedFields.selectFields, options);
                        totalCountOption = {};
                        if (!requestedFields.totalCount) return [3 /*break*/, 2];
                        _a = {};
                        return [4 /*yield*/, this.buildFindQuery(whereUserInput).getCount()];
                    case 1:
                        // We need to get total count without applying limit. totalCount should return same result for the same where input
                        // no matter which relay option is applied (after, after)
                        totalCountOption = (_a.totalCount = _b.sent(), _a);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, qb.getMany()];
                    case 3:
                        rawData = _b.sent();
                        returnData = rawData.length > limit ? rawData.slice(0, limit) : rawData;
                        return [2 /*return*/, __assign(__assign({}, totalCountOption), { edges: returnData.map(function (item) {
                                    return {
                                        node: item,
                                        cursor: _this.relayService.encodeCursor(item, sorts)
                                    };
                                }), pageInfo: this.relayService.getPageInfo(rawData, sorts, relayPageOptions) })];
                }
            });
        });
    };
    BaseService.prototype.buildFindQuery = function (where, orderBy, pageOptions, fields, options) {
        var _this = this;
        var _a;
        if (where === void 0) { where = {}; }
        var DEFAULT_LIMIT = 50;
        var manager = (_a = options === null || options === void 0 ? void 0 : options.manager) !== null && _a !== void 0 ? _a : this.manager;
        var qb = manager.createQueryBuilder(this.entityClass, this.klass);
        if (!pageOptions) {
            pageOptions = {
                limit: DEFAULT_LIMIT
            };
        }
        qb = qb.take(pageOptions.limit || DEFAULT_LIMIT);
        if (pageOptions.offset) {
            qb = qb.skip(pageOptions.offset);
        }
        if (fields) {
            // We always need to select ID or dataloaders will not function properly
            if (fields.indexOf('id') === -1) {
                fields.push('id');
            }
            // Querybuilder requires you to prefix all fields with the table alias.  It also requires you to
            // specify the field name using it's TypeORM attribute name, not the camel-cased DB column name
            var selection = fields
                .filter(function (field) { return _this.columnMap[field]; }) // This will filter out any association records that come in @Fields
                .map(function (field) { return _this.klass + "." + field; });
            qb = qb.select(selection);
        }
        if (orderBy) {
            if (!Array.isArray(orderBy)) {
                orderBy = [orderBy];
            }
            orderBy.forEach(function (orderByItem) {
                var parts = orderByItem.toString().split('_');
                // TODO: ensure attr is one of the properties on the model
                var attr = parts[0];
                var direction = parts[1];
                qb = qb.addOrderBy(_this.attrToDBColumn(attr), direction);
            });
        }
        // Soft-deletes are filtered out by default, setting `deletedAt_all` is the only way to turn this off
        var hasDeletedAts = Object.keys(where).find(function (key) { return key.indexOf('deletedAt_') === 0; });
        // If no deletedAt filters specified, hide them by default
        if (!hasDeletedAts) {
            // eslint-disable-next-line @typescript-eslint/camelcase
            where.deletedAt_eq = null; // Filter out soft-deleted items
        }
        else if (typeof where.deletedAt_all !== 'undefined') {
            // Delete this param so that it doesn't try to filter on the magic `all` param
            // Put this here so that we delete it even if `deletedAt_all: false` specified
            delete where.deletedAt_all;
        }
        else {
            // If we get here, the user has added a different deletedAt filter, like deletedAt_gt: <date>
            // do nothing because the specific deleted at filters will be added by processWhereOptions
        }
        // Keep track of a counter so that TypeORM doesn't reuse our variables that get passed into the query if they
        // happen to reference the same column
        var paramKeyCounter = { counter: 0 };
        var processWheres = function (qb, where) {
            // where is of shape { userName_contains: 'a' }
            Object.keys(where).forEach(function (k) {
                var paramKey = "param" + paramKeyCounter.counter;
                // increment counter each time we add a new where clause so that TypeORM doesn't reuse our input variables
                paramKeyCounter.counter = paramKeyCounter.counter + 1;
                var key = k; // userName_contains
                var parts = key.toString().split('_'); // ['userName', 'contains']
                var attr = parts[0]; // userName
                var operator = parts.length > 1 ? parts[1] : 'eq'; // contains
                return torm_1.addQueryBuilderWhereItem(qb, paramKey, _this.attrToDBColumn(attr), operator, where[key]);
            });
            return qb;
        };
        // WhereExpression comes in the following shape:
        // {
        //   AND?: WhereInput[];
        //   OR?: WhereInput[];
        //   [key: string]: string | number | null;
        // }
        var processWhereInput = function (qb, where) {
            var AND = where.AND, OR = where.OR, rest = __rest(where, ["AND", "OR"]);
            if (AND && AND.length) {
                var ands_1 = AND.filter(function (value) { return JSON.stringify(value) !== '{}'; });
                if (ands_1.length) {
                    qb.andWhere(new typeorm_1.Brackets(function (qb2) {
                        ands_1.forEach(function (where) {
                            if (Object.keys(where).length === 0) {
                                return; // disregard empty where objects
                            }
                            qb2.andWhere(new typeorm_1.Brackets(function (qb3) {
                                processWhereInput(qb3, where);
                                return qb3;
                            }));
                        });
                    }));
                }
            }
            if (OR && OR.length) {
                var ors_1 = OR.filter(function (value) { return JSON.stringify(value) !== '{}'; });
                if (ors_1.length) {
                    qb.andWhere(new typeorm_1.Brackets(function (qb2) {
                        ors_1.forEach(function (where) {
                            if (Object.keys(where).length === 0) {
                                return; // disregard empty where objects
                            }
                            qb2.orWhere(new typeorm_1.Brackets(function (qb3) {
                                processWhereInput(qb3, where);
                                return qb3;
                            }));
                        });
                    }));
                }
            }
            if (rest) {
                processWheres(qb, rest);
            }
            return qb;
        };
        if (Object.keys(where).length) {
            processWhereInput(qb, where);
        }
        return qb;
    };
    BaseService.prototype.findOne = function (where, // V3: WhereExpression
    options) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find(where, undefined, undefined, undefined, undefined, options)];
                    case 1:
                        items = _a.sent();
                        if (!items.length) {
                            throw new Error("Unable to find " + this.entityClass.name + " where " + JSON.stringify(where));
                        }
                        else if (items.length > 1) {
                            throw new Error("Found " + items.length + " " + this.entityClass.name + "s where " + JSON.stringify(where));
                        }
                        return [2 /*return*/, items[0]];
                }
            });
        });
    };
    BaseService.prototype.create = function (data, userId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var manager, entity, errors;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        manager = (_a = options === null || options === void 0 ? void 0 : options.manager) !== null && _a !== void 0 ? _a : this.manager;
                        entity = manager.create(this.entityClass, __assign(__assign({}, data), { createdById: userId }));
                        return [4 /*yield*/, class_validator_1.validate(entity, { skipMissingProperties: true })];
                    case 1:
                        errors = _b.sent();
                        if (errors.length) {
                            // TODO: create our own error format
                            throw new type_graphql_1.ArgumentValidationError(errors);
                        }
                        // TODO: remove any when this is fixed: https://github.com/Microsoft/TypeScript/issues/21592
                        // TODO: Fix `any`
                        return [2 /*return*/, manager.save(entity, { reload: true })];
                }
            });
        });
    };
    BaseService.prototype.createMany = function (data, userId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var manager, results, _i, results_1, obj, errors;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        manager = (_a = options === null || options === void 0 ? void 0 : options.manager) !== null && _a !== void 0 ? _a : this.manager;
                        data = data.map(function (item) {
                            return __assign(__assign({}, item), { createdById: userId });
                        });
                        results = manager.create(this.entityClass, data);
                        _i = 0, results_1 = results;
                        _b.label = 1;
                    case 1:
                        if (!(_i < results_1.length)) return [3 /*break*/, 4];
                        obj = results_1[_i];
                        return [4 /*yield*/, class_validator_1.validate(obj, { skipMissingProperties: true })];
                    case 2:
                        errors = _b.sent();
                        if (errors.length) {
                            // TODO: create our own error format that matches Mike B's format
                            throw new type_graphql_1.ArgumentValidationError(errors);
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, manager.save(results, { reload: true })];
                }
            });
        });
    };
    // TODO: There must be a more succinct way to:
    //   - Test the item exists
    //   - Update
    //   - Return the full object
    // NOTE: assumes all models have a unique `id` field
    // W extends Partial<E>
    BaseService.prototype.update = function (data, where, // V3: WhereExpression,
    userId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var manager, found, mergeData, entity, errors, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        manager = (_a = options === null || options === void 0 ? void 0 : options.manager) !== null && _a !== void 0 ? _a : this.manager;
                        return [4 /*yield*/, this.findOne(where)];
                    case 1:
                        found = _b.sent();
                        mergeData = { id: found.id, updatedById: userId };
                        entity = manager.merge(this.entityClass, new this.entityClass(), data, mergeData);
                        return [4 /*yield*/, class_validator_1.validate(entity, { skipMissingProperties: true })];
                    case 2:
                        errors = _b.sent();
                        if (errors.length) {
                            throw new type_graphql_1.ArgumentValidationError(errors);
                        }
                        return [4 /*yield*/, manager.save(entity)];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, manager.findOneOrFail(this.entityClass, result.id)];
                }
            });
        });
    };
    BaseService.prototype.delete = function (where, userId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var manager, data, whereNotDeleted, found, idData, entity;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        manager = (_a = options === null || options === void 0 ? void 0 : options.manager) !== null && _a !== void 0 ? _a : this.manager;
                        data = {
                            deletedAt: new Date().toISOString(),
                            deletedById: userId
                        };
                        whereNotDeleted = __assign(__assign({}, where), { deletedAt: null });
                        return [4 /*yield*/, manager.findOneOrFail(this.entityClass, whereNotDeleted)];
                    case 1:
                        found = _b.sent();
                        idData = { id: found.id };
                        entity = manager.merge(this.entityClass, new this.entityClass(), data, idData);
                        return [4 /*yield*/, manager.save(entity)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: found.id }];
                }
            });
        });
    };
    __decorate([
        decorators_1.debug('base-service:findConnection'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], BaseService.prototype, "findConnection", null);
    __decorate([
        decorators_1.debug('base-service:buildFindQuery'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object, Array, Object]),
        __metadata("design:returntype", typeorm_1.SelectQueryBuilder)
    ], BaseService.prototype, "buildFindQuery", null);
    return BaseService;
}());
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map