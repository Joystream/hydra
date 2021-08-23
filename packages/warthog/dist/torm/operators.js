"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addQueryBuilderWhereItem = void 0;
function addQueryBuilderWhereItem(qb, // query builder will be mutated (chained) in this function
parameterKey, // Paremeter key used in query builder
columnWithAlias, // ex. "user"."name"
operator, // ex. eq
value) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    switch (operator) {
        case 'eq':
            if (value === null) {
                return qb.andWhere(columnWithAlias + " IS NULL");
            }
            return qb.andWhere(columnWithAlias + " = :" + parameterKey, (_a = {}, _a[parameterKey] = value, _a));
        case 'not':
            return qb.andWhere(columnWithAlias + " != :" + parameterKey, (_b = {}, _b[parameterKey] = value, _b));
        case 'lt':
            return qb.andWhere(columnWithAlias + " < :" + parameterKey, (_c = {}, _c[parameterKey] = value, _c));
        case 'lte':
            return qb.andWhere(columnWithAlias + " <= :" + parameterKey, (_d = {}, _d[parameterKey] = value, _d));
        case 'gt':
            return qb.andWhere(columnWithAlias + " > :" + parameterKey, (_e = {}, _e[parameterKey] = value, _e));
        case 'gte':
            return qb.andWhere(columnWithAlias + " >= :" + parameterKey, (_f = {}, _f[parameterKey] = value, _f));
        case 'in':
            // IN (:... is the syntax for exploding array params into (?, ?, ?) in QueryBuilder
            return qb.andWhere(columnWithAlias + " IN (:..." + parameterKey + ")", (_g = {},
                _g[parameterKey] = value.length ? value : [''],
                _g));
        case 'contains':
            return qb.andWhere(columnWithAlias + " ILIKE :" + parameterKey, (_h = {},
                _h[parameterKey] = "%" + value + "%",
                _h));
        case 'startsWith':
            return qb.andWhere(columnWithAlias + " ILIKE :" + parameterKey, (_j = {},
                _j[parameterKey] = value + "%",
                _j));
        case 'endsWith':
            return qb.andWhere(columnWithAlias + " ILIKE :" + parameterKey, (_k = {},
                _k[parameterKey] = "%" + value,
                _k));
        case 'json': {
            // It is not recommended to have snake_cased keys, but we should support them
            // Assume: value = { foo: { bar { my_baz_gt: 1 } } }
            var flat = flattenObject(value); // { "foo.bar.my_baz_gt": 1 }
            Object.entries(flat).forEach(function (_a, param_idx) {
                var key = _a[0], val = _a[1];
                // key = "foo.bar.my_baz_gt"
                // val = 1
                var path = key.split('.'); // ["foo", "bar", "my_baz_gt"]
                var leaf = path.pop(); // "my_baz_gt"
                var nonTerminalPathParts = path; // ["foo", "bar"]
                if (!leaf) {
                    throw new Error("Invalid JSON search criteria " + value);
                }
                // TODO: update so that property can be an underscored leaf
                var leafParts = leaf.split('_'); // ["my", "baz", "gt"]
                var operator = leafParts.pop(); // "gt"
                var attr = leafParts.join('_'); // my_baz
                if (!operator) {
                    throw new Error("Could not find operator in " + leaf);
                }
                if (operator === 'json') {
                    throw new Error('Nested json filtering is not supported');
                }
                // TODO: add tests that:
                // go at least 3 levels deep
                // have snake_cased keys
                var pre = nonTerminalPathParts.map(function (pathPart) { return "->'" + pathPart + "'"; }).join(''); // ->'foo'->'bar'
                // Adds: "user"."json_field"->'foo'->'bar'->>'my_baz' > 1
                addQueryBuilderWhereItem(qb, parameterKey + "__" + param_idx, // Make sure parameterKey used here is unique so that it doesn't get value from previous "where"
                "" + columnWithAlias + pre + "->>'" + attr + "'", operator, val);
            });
            return qb;
        }
        // Postgres array functions: https://www.postgresql.org/docs/10/functions-array.html
        case 'containsAll':
            return qb.andWhere(columnWithAlias + " @> :" + parameterKey, (_l = {},
                _l[parameterKey] = value,
                _l));
        case 'containsNone':
            return qb.andWhere("NOT (" + columnWithAlias + " && :" + parameterKey + ")", (_m = {},
                _m[parameterKey] = value,
                _m));
        case 'containsAny':
            return qb.andWhere(columnWithAlias + " && :" + parameterKey, (_o = {},
                _o[parameterKey] = value,
                _o));
        default:
            throw new Error("Can't find operator " + operator);
    }
}
exports.addQueryBuilderWhereItem = addQueryBuilderWhereItem;
function flattenObject(obj) {
    var result = {};
    for (var outer in obj) {
        if (typeof obj[outer] == 'object' && obj[outer] !== null) {
            var flatObject = flattenObject(obj[outer]);
            for (var inner in flatObject) {
                result[outer + '.' + inner] = flatObject[inner];
            }
        }
        else {
            result[outer] = obj[outer];
        }
    }
    return result;
}
//# sourceMappingURL=operators.js.map