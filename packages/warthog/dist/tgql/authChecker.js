"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authChecker = void 0;
// This authChecker is used by type-graphql's @Authorized decorator
var authChecker = function (_a, permissions) {
    var user = _a.context.user;
    if (!user) {
        return false;
    }
    // Just checking @Authorized() - return true since we know there is a user now
    if (permissions.length === 0) {
        return user !== undefined;
    }
    // Check that permissions overlap
    return permissions.some(function (perm) { return user.permissions.includes(perm); });
};
exports.authChecker = authChecker;
//# sourceMappingURL=authChecker.js.map