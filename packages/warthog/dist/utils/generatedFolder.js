"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedFolderPath = void 0;
var path = require("path");
var generatedFolderPath = function () {
    return process.env.WARTHOG_GENERATED_FOLDER || path.join(process.cwd(), 'generated');
};
exports.generatedFolderPath = generatedFolderPath;
//# sourceMappingURL=generatedFolder.js.map