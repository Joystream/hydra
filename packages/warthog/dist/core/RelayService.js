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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayService = void 0;
var assert = require('assert').strict;
var typedi_1 = require("typedi");
var encoding_1 = require("./encoding");
function isFirstAfter(pageType) {
    return pageType.last === undefined;
}
function isSort(sort) {
    return sort.column !== undefined;
}
function isSortArray(sort) {
    var arr = sort;
    return Array.isArray(arr) && arr.length > 0 && arr[0].column !== undefined;
}
var RelayService = /** @class */ (function () {
    function RelayService() {
        // TODO: use DI
        this.encoding = new encoding_1.EncodingService();
    }
    RelayService.prototype.getPageInfo = function (items, sortable, pageOptions) {
        if (!items.length) {
            return {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: '',
                endCursor: ''
            };
        }
        var limit;
        var cursor;
        if (isFirstAfter(pageOptions)) {
            limit = pageOptions.first;
            cursor = pageOptions.after;
        }
        else {
            limit = pageOptions.last;
            cursor = pageOptions.before;
        }
        var _a = this.firstAndLast(items, limit), firstItem = _a[0], lastItem = _a[1];
        var sort = this.normalizeSort(sortable);
        return {
            hasNextPage: items.length > limit,
            // Right now we assume there is a previous page if client specifies the cursor
            // typically a client will not specify a cursor on the first page and would otherwise
            hasPreviousPage: !!cursor,
            startCursor: this.encodeCursor(firstItem, sort),
            endCursor: this.encodeCursor(lastItem, sort)
        };
    };
    // Given an array of items, return the first and last
    // Note that this isn't as simple as returning the first and last as we've
    // asked for limit+1 items (to know if there is a next page)
    RelayService.prototype.firstAndLast = function (items, limit) {
        assert(items.length, 'Items cannot be empty');
        assert(limit > 0, 'Limit must be greater than 0');
        var onLastPage = items.length <= limit;
        var lastItemIndex = onLastPage ? items.length - 1 : limit - 1;
        var firstItem = items[0];
        var lastItem = items[lastItemIndex];
        return [firstItem, lastItem];
    };
    RelayService.prototype.encodeCursor = function (record, sortable) {
        assert(record, 'Record is not defined');
        assert(record.getValue, "Record must be a BaseModel: " + JSON.stringify(record, null, 2));
        var sortArray = this.normalizeSort(sortable);
        var payload = sortArray.map(function (sort) { return record.getValue(sort.column); });
        return this.encoding.encode(payload);
    };
    RelayService.prototype.decodeCursor = function (cursor) {
        return this.encoding.decode(cursor);
    };
    RelayService.prototype.toSortArray = function (sort) {
        if (!sort) {
            return [];
        }
        else if (isSortArray(sort)) {
            return sort;
        }
        else if (isSort(sort)) {
            return [sort];
        }
        // Takes sorts of the form ["name_DESC", "startAt_ASC"] and converts to relay service's internal
        // representation  [{ column: 'name', direction: 'DESC' }, { column: 'startAt', direction: 'ASC' }]
        var stringArray = Array.isArray(sort) ? sort : [sort];
        return stringArray.map(function (str) {
            var sorts = str.split('_');
            return { column: sorts[0], direction: sorts[1] };
        });
    };
    RelayService.prototype.normalizeSort = function (sortable) {
        var sort = this.toSortArray(sortable);
        if (!sort.length) {
            return [{ column: 'id', direction: 'ASC' }];
        }
        var hasIdSort = sort.find(function (item) { return item.column === 'id'; });
        // If we're not already sorting by ID, add this to sort to make cursor work
        // When the user-specified sort isn't unique
        if (!hasIdSort) {
            sort.push({ column: 'id', direction: 'ASC' });
        }
        return sort;
    };
    RelayService.prototype.flipDirection = function (direction) {
        return direction === 'ASC' ? 'DESC' : 'ASC';
    };
    RelayService.prototype.effectiveOrder = function (sortable, pageOptions) {
        var _this = this;
        var sorts = this.normalizeSort(sortable);
        if (isFirstAfter(pageOptions)) {
            return sorts;
        }
        return sorts.map(function (_a) {
            var column = _a.column, direction = _a.direction;
            return { column: column, direction: _this.flipDirection(direction) };
        });
    };
    RelayService.prototype.effectiveOrderStrings = function (sortable, pageOptions) {
        var sorts = this.effectiveOrder(sortable, pageOptions);
        return this.toSortStrings(sorts);
    };
    RelayService.prototype.toSortStrings = function (sorts) {
        return sorts.map(function (sort) {
            return [sort.column, sort.direction].join('_');
        });
    };
    RelayService.prototype.getFilters = function (sortable, pageOptions) {
        // Ex: [ { column: 'createdAt', direction: 'ASC' }, { column: 'name', direction: 'DESC' }, { column: 'id', direction: 'ASC' } ]
        var cursor = isFirstAfter(pageOptions) ? pageOptions.after : pageOptions.before;
        if (!cursor) {
            return {};
        }
        var decodedCursor = this.decodeCursor(cursor); // Ex: ['1981-10-15T00:00:00.000Z', 'Foo', '1']
        var sorts = this.effectiveOrder(sortable, pageOptions);
        var comparisonOperator = function (sortDirection) { return (sortDirection == 'ASC' ? 'gt' : 'lt'); };
        /*
          Given:
            sorts = [['c', 'ASC'], ['b', 'DESC'], ['id', 'ASC']]
            decodedCursor = ['1981-10-15T00:00:00.000Z', 'Foo', '1']
    
          Output:
            {
              OR: [
                { createdAt_gt: '1981-10-15T00:00:00.000Z' },
                { createdAt_eq: '1981-10-15T00:00:00.000Z', name_lt: 'Foo' },
                { createdAt_eq: '1981-10-15T00:00:00.000Z', name_eq: 'Foo', id_gt: '1' }
              ]
            }
         */
        return {
            OR: sorts.map(function (_a, i) {
                var _b;
                var column = _a.column, direction = _a.direction;
                var allOthersEqual = sorts
                    .slice(0, i)
                    .map(function (other, j) {
                    var _a;
                    return (_a = {}, _a[other.column + "_eq"] = decodedCursor[j], _a);
                });
                return Object.assign.apply(Object, __spreadArray([(_b = {},
                        _b[column + "_" + comparisonOperator(direction)] = decodedCursor[i],
                        _b)], allOthersEqual));
            })
        };
    };
    RelayService = __decorate([
        typedi_1.Service(),
        __metadata("design:paramtypes", [])
    ], RelayService);
    return RelayService;
}());
exports.RelayService = RelayService;
//# sourceMappingURL=RelayService.js.map