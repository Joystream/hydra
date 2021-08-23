"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFromGlobArray = exports.loadFromGlobString = exports.findFileNamesFromGlob = void 0;
var glob = require("glob");
function findFileNamesFromGlob(globString) {
    return glob.sync(globString);
}
exports.findFileNamesFromGlob = findFileNamesFromGlob;
function loadFromGlobString(globString) {
    var filePaths = findFileNamesFromGlob(globString);
    filePaths.map(function (fileName) { return require(fileName); });
}
exports.loadFromGlobString = loadFromGlobString;
function loadFromGlobArray(globs) {
    if (!globs.length) {
        throw new Error('globs is required!');
    }
    globs.forEach(function (globString) {
        if (typeof globString === 'string') {
            loadFromGlobString(globString);
        }
    });
    return undefined;
}
exports.loadFromGlobArray = loadFromGlobArray;
//# sourceMappingURL=loadGlobs.js.map