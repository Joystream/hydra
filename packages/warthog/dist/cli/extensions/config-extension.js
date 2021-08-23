"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../../core");
module.exports = function (toolbox) {
    toolbox.config = {
        load: function create() {
            return new core_1.Config();
        }
    };
};
//# sourceMappingURL=config-extension.js.map