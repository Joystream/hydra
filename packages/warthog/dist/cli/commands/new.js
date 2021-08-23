"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var execa = require("execa");
var fs = require("fs");
var path = require("path");
var util_1 = require("util");
var packageJson = require('../../../package.json'); // eslint-disable-line
var readdir = util_1.promisify(fs.readdir);
var stat = util_1.promisify(fs.stat);
exports.default = {
    name: 'new',
    alias: ['n'],
    run: function (toolbox) { return __awaiter(void 0, void 0, void 0, function () {
        var first, name, n, warthogVersion, result, error_1, props, newFolder, files, generateFolder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    first = toolbox.parameters.first;
                    name = first;
                    if (!!name) return [3 /*break*/, 2];
                    return [4 /*yield*/, toolbox.prompt.ask([
                            { type: 'input', name: 'n', message: 'What do you want your project to be called?' }
                        ])];
                case 1:
                    n = (_a.sent()).n;
                    name = String(n);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, execa.command('npm show warthog version')];
                case 3:
                    result = _a.sent();
                    warthogVersion = result.stdout;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    warthogVersion = '^2'; // Default to version 2
                    return [3 /*break*/, 5];
                case 5:
                    props = {
                        className: toolbox.strings.pascalCase(name),
                        camelName: toolbox.strings.camelCase(name),
                        kebabName: toolbox.strings.kebabCase(name),
                        packageJson: packageJson,
                        warthogVersion: warthogVersion
                    };
                    newFolder = toolbox.filesystem.path(__dirname, '../templates/new');
                    return [4 /*yield*/, getFileRecursive(newFolder)];
                case 6:
                    files = _a.sent();
                    generateFolder = process.env.WARTHOG_CLI_GENERATE_PATH || process.cwd();
                    files.forEach(function (file) { return __awaiter(void 0, void 0, void 0, function () {
                        var relativePath;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    relativePath = path.relative(newFolder, file);
                                    return [4 /*yield*/, generateFile(toolbox, props, "new/" + relativePath, generateFolder, relativePath.slice(0, -4) // remove .ejs
                                        )];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }
};
function generateFile(toolbox, props, template, destFolder, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var target, generated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (filename.startsWith('_')) {
                        filename = filename.replace(/^_/, '.');
                    }
                    target = path.join(destFolder, '/', filename);
                    return [4 /*yield*/, toolbox.template.generate({
                            template: template,
                            target: target,
                            props: props
                        })];
                case 1:
                    generated = _a.sent();
                    toolbox.filesystem.write(target, generated);
                    toolbox.print.info("Generated file at " + target);
                    return [2 /*return*/];
            }
        });
    });
}
function getFileRecursive(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var subdirs, files;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readdir(dir)];
                case 1:
                    subdirs = _a.sent();
                    return [4 /*yield*/, Promise.all(subdirs.map(function (subdir) { return __awaiter(_this, void 0, void 0, function () {
                            var res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        res = path.resolve(dir, subdir);
                                        return [4 /*yield*/, stat(res)];
                                    case 1: return [2 /*return*/, (_a.sent()).isDirectory() ? getFileRecursive(res) : [res]];
                                }
                            });
                        }); }))];
                case 2:
                    files = _a.sent();
                    return [2 /*return*/, Array.from(files.reduce(function (a, f) { return a.concat(f); }, []))];
            }
        });
    });
}
//# sourceMappingURL=new.js.map