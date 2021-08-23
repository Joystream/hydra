"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedFields = exports.RawFields = exports.Fields = void 0;
var graphqlFields = require("graphql-fields");
var type_graphql_1 = require("type-graphql");
function Fields() {
    return type_graphql_1.createParamDecorator(function (_a) {
        var info = _a.info;
        // This object will be of the form:
        //   rawFields {
        //     __objectType
        //     baseField: {},
        //     association: { subField: "foo"}
        //   }
        // We pull out items with subFields
        var rawFields = graphqlFields(info);
        var scalars = Object.keys(rawFields).filter(function (item) {
            return !item.startsWith('__');
        });
        return scalars;
    });
}
exports.Fields = Fields;
function RawFields() {
    return type_graphql_1.createParamDecorator(function (_a) {
        var info = _a.info;
        return graphqlFields(info);
    });
}
exports.RawFields = RawFields;
function NestedFields() {
    return type_graphql_1.createParamDecorator(function (_a) {
        var info = _a.info;
        // This object will be of the form:
        //   rawFields {
        //     baseField: {},
        //     association: { subField: "foo"}
        //   }
        // We need to pull out items with subFields
        var rawFields = graphqlFields(info);
        var output = { scalars: [] };
        var _loop_1 = function (fieldKey) {
            if (Object.keys(rawFields[fieldKey]).length === 0) {
                output.scalars.push(fieldKey);
            }
            else {
                var subFields_1 = rawFields[fieldKey];
                output[fieldKey] = Object.keys(subFields_1).filter(function (subKey) {
                    return Object.keys(subFields_1[subKey]).length === 0;
                });
            }
        };
        for (var fieldKey in rawFields) {
            _loop_1(fieldKey);
        }
        return output;
    });
}
exports.NestedFields = NestedFields;
//# sourceMappingURL=Fields.js.map