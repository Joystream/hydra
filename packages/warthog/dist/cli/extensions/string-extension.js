"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (toolbox) {
    toolbox.string = {
        supplant: function supplant(str, obj) {
            return str.replace(/\${([^${}]*)}/g, function (a, b) {
                var r = obj[b];
                return typeof r === 'string' ? r : a;
            });
        }
    };
};
//# sourceMappingURL=string-extension.js.map