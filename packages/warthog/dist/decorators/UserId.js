"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = void 0;
var type_graphql_1 = require("type-graphql");
function UserId() {
    return type_graphql_1.createParamDecorator(function (_a) {
        var context = _a.context;
        if (!context.user) {
            throw new Error('`user` attribute not found on context');
        }
        if (!context.user.id) {
            throw new Error('`user` attribute does not contain an `id`');
        }
        return context.user.id;
    });
}
exports.UserId = UserId;
//# sourceMappingURL=UserId.js.map