"use strict";
// TODO-MVP: Add custom scalars such as graphql-iso-date
// import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
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
exports.CodeGenerator = void 0;
var fs_1 = require("fs");
var graphql_1 = require("graphql");
var mkdirp = require("mkdirp");
var path = require("path");
var type_graphql_1 = require("type-graphql");
var util = require("util");
var gql_1 = require("../gql");
var schema_1 = require("../schema");
var tgql_1 = require("../tgql");
// Load all model files so that decorators will gather metadata for code generation
var Debug = require("debug");
var debug = Debug('warthog:code-generators');
var writeFilePromise = util.promisify(fs_1.writeFile);
var CodeGenerator = /** @class */ (function () {
    function CodeGenerator(generatedFolder, 
    // @ts-ignore
    modelsArray, options) {
        this.generatedFolder = generatedFolder;
        this.modelsArray = modelsArray;
        this.options = options;
        this.createGeneratedFolder();
        tgql_1.loadFromGlobArray(modelsArray);
    }
    CodeGenerator.prototype.createGeneratedFolder = function () {
        return mkdirp.sync(this.generatedFolder);
    };
    CodeGenerator.prototype.generate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug('generate:start');
                        return [4 /*yield*/, this.writeGeneratedIndexFile()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.writeGeneratedTSTypes()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.writeOrmConfig()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.writeSchemaFile()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.generateBinding()];
                    case 5:
                        _a.sent();
                        debug('generate:end');
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeGenerator.prototype.generateBinding = function () {
        return __awaiter(this, void 0, void 0, function () {
            var schemaFilePath, outputBindingPath, x;
            return __generator(this, function (_a) {
                debug('generateBinding:start');
                schemaFilePath = path.join(this.generatedFolder, 'schema.graphql');
                outputBindingPath = path.join(this.generatedFolder, 'binding.ts');
                x = gql_1.generateBindingFile(schemaFilePath, outputBindingPath);
                debug('generateBinding:end');
                return [2 /*return*/, x];
            });
        });
    };
    CodeGenerator.prototype.buildGraphQLSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.schema) return [3 /*break*/, 2];
                        debug('code-generator:buildGraphQLSchema:start');
                        debug(this.options.resolversPath);
                        _a = this;
                        return [4 /*yield*/, type_graphql_1.buildSchema({
                                // TODO: we should replace this with an empty authChecker
                                // Note: using the base authChecker here just to generated the .graphql file
                                // it's not actually being utilized here
                                authChecker: tgql_1.authChecker,
                                scalarsMap: [
                                    {
                                        type: 'ID',
                                        scalar: graphql_1.GraphQLID
                                    }
                                ],
                                resolvers: this.options.resolversPath,
                                validate: this.options.validateResolvers
                            })];
                    case 1:
                        _a.schema = _b.sent();
                        debug('code-generator:buildGraphQLSchema:end');
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.schema];
                }
            });
        });
    };
    CodeGenerator.prototype.writeGeneratedTSTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var generatedTSTypes, x;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug('writeGeneratedTSTypes:start');
                        return [4 /*yield*/, this.getGeneratedTypes()];
                    case 1:
                        generatedTSTypes = _a.sent();
                        return [4 /*yield*/, this.writeToGeneratedFolder('classes.ts', generatedTSTypes)];
                    case 2:
                        x = _a.sent();
                        debug('writeGeneratedTSTypes:end');
                        return [2 /*return*/, x];
                }
            });
        });
    };
    CodeGenerator.prototype.getGeneratedTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var x;
            return __generator(this, function (_a) {
                debug('getGeneratedTypes:start');
                x = schema_1.SchemaGenerator.generate(this.options.warthogImportPath);
                debug('getGeneratedTypes:end');
                return [2 /*return*/, x];
            });
        });
    };
    CodeGenerator.prototype.writeSchemaFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var x;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug('writeSchemaFile:start');
                        return [4 /*yield*/, this.buildGraphQLSchema()];
                    case 1:
                        _a.sent();
                        x = this.writeToGeneratedFolder('schema.graphql', graphql_1.printSchema(this.schema));
                        debug('writeSchemaFile:end');
                        return [2 /*return*/, x];
                }
            });
        });
    };
    // Write an index file that loads `classes` so that you can just import `../../generated`
    // in your resolvers
    CodeGenerator.prototype.writeGeneratedIndexFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.writeToGeneratedFolder('index.ts', "export * from './classes';")];
            });
        });
    };
    CodeGenerator.prototype.writeOrmConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contents;
            return __generator(this, function (_a) {
                contents = "import { getBaseConfig } from '" + this.options.warthogImportPath + "';\n\nmodule.exports = getBaseConfig();";
                return [2 /*return*/, this.writeToGeneratedFolder('ormconfig.ts', contents)];
            });
        });
    };
    CodeGenerator.prototype.writeToGeneratedFolder = function (filename, contents) {
        return __awaiter(this, void 0, void 0, function () {
            var x;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug('writeToGeneratedFolder:' + filename + ':start');
                        return [4 /*yield*/, writeFilePromise(path.join(this.generatedFolder, filename), contents, {
                                encoding: 'utf8',
                                flag: 'w'
                            })];
                    case 1:
                        x = _a.sent();
                        debug('writeToGeneratedFolder:' + filename + ':end');
                        return [2 /*return*/, x];
                }
            });
        });
    };
    return CodeGenerator;
}());
exports.CodeGenerator = CodeGenerator;
//# sourceMappingURL=code-generator.js.map