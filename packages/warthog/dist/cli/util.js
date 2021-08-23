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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandError = void 0;
/**
 * Indicates, that CLI command completed with error,
 * but all details were already written to STDERR
 */
var CommandError = /** @class */ (function (_super) {
    __extends(CommandError, _super);
    function CommandError() {
        var _this = _super.call(this, 'command failed') || this;
        _this.isCommandError = true;
        return _this;
    }
    return CommandError;
}(Error));
exports.CommandError = CommandError;
//# sourceMappingURL=util.js.map