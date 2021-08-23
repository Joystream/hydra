"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var Debug = require("debug");
var util = require("util");
// TODO: better logger
exports.logger = {
    debug: Debug('warthog:debug'),
    error: console.error,
    info: console.info,
    log: console.log,
    warn: console.warn,
    logObject: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return console.log(util.inspect(args, { showHidden: false, depth: null }));
    } // eslint-disable-line
};
//# sourceMappingURL=logger.js.map