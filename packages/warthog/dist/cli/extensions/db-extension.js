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
var childProcess = require("child_process");
var path = require("path");
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var pgtools = require("pgtools");
var util = require("util");
var exec = util.promisify(childProcess.exec);
module.exports = function (toolbox) {
    var load = toolbox.config.load, _a = toolbox.print, error = _a.error, info = _a.info;
    toolbox.db = {
        create: function create(database) {
            return __awaiter(this, void 0, void 0, function () {
                var config, createDb, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!database) {
                                error('Database name is required');
                                return [2 /*return*/, false];
                            }
                            config = load();
                            createDb = util.promisify(pgtools.createdb);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, createDb(getPgConfig(config), database)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            if (e_1.message.indexOf('duplicate') > -1) {
                                info("Database '" + database + "' already exists");
                                return [2 /*return*/, true];
                            }
                            error(e_1.message);
                            return [2 /*return*/, false];
                        case 4:
                            info("Database '" + database + "' created!");
                            return [2 /*return*/, true];
                    }
                });
            });
        },
        drop: function drop() {
            return __awaiter(this, void 0, void 0, function () {
                var config, database, dropDb, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            config = load();
                            database = config.get('DB_DATABASE');
                            dropDb = util.promisify(pgtools.dropdb);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, dropDb(getPgConfig(config), database)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_2 = _a.sent();
                            if (e_2.name.indexOf('invalid_catalog_name') > -1) {
                                info("Database '" + database + "' does not exist");
                                return [2 /*return*/, true];
                            }
                            error(e_2.message);
                            return [2 /*return*/, false];
                        case 4:
                            info("Database '" + database + "' dropped!");
                            return [2 /*return*/, true];
                    }
                });
            });
        },
        migrate: function migrate() {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            load();
                            return [4 /*yield*/, runTypeORMCommand('migration:run', toolbox)];
                        case 1:
                            result = _a.sent();
                            // If we don't run the command because of some other error, just return the error
                            if (typeof result === 'string') {
                                return [2 /*return*/, error(result)];
                            }
                            if (result.stderr) {
                                return [2 /*return*/, error(result.stderr)];
                            }
                            else {
                                return [2 /*return*/, info(result.stdout)];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        },
        generateMigration: function generateMigration(name) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            load();
                            // Set name to pascal case so that migration class names are pascaled (eslint)
                            name = toolbox.strings.pascalCase(name);
                            return [4 /*yield*/, runTypeORMCommand("migration:generate -n " + name, toolbox, "--dir ./" + process.env.WARTHOG_DB_MIGRATIONS_DIR)];
                        case 1:
                            result = _a.sent();
                            // If we don't run the command because of some other error, just return the error
                            if (typeof result === 'string') {
                                return [2 /*return*/, error(result)];
                            }
                            if (result.stderr) {
                                return [2 /*return*/, error(result.stderr)];
                            }
                            else {
                                return [2 /*return*/, info(result.stdout)];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
    };
};
function runTypeORMCommand(command, toolbox, additionalParams) {
    if (additionalParams === void 0) { additionalParams = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var tsNodePath, typeORMPath, ormConfigFullPath, relativeOrmConfigPath, cmd, filteredEnv, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tsNodePath = path.join(process.cwd(), './node_modules/.bin/ts-node');
                    typeORMPath = path.join(process.cwd(), './node_modules/.bin/typeorm');
                    ormConfigFullPath = path.join(String(process.env.WARTHOG_GENERATED_FOLDER), 'ormconfig.ts');
                    relativeOrmConfigPath = path.relative(process.cwd(), ormConfigFullPath);
                    if (toolbox.filesystem.isNotFile(ormConfigFullPath)) {
                        return [2 /*return*/, "Cannot find ormconfig path: " + ormConfigFullPath];
                    }
                    cmd = tsNodePath + " " + typeORMPath + " " + command + "  --config " + relativeOrmConfigPath + " " + additionalParams;
                    filteredEnv = filteredProcessEnv();
                    return [4 /*yield*/, exec(cmd, { env: filteredEnv })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function filteredProcessEnv() {
    var raw = process.env;
    return Object.keys(raw)
        .filter(function (key) { return !key.startsWith('TYPEORM_'); })
        .reduce(function (obj, key) {
        obj[key] = raw[key];
        return obj;
    }, {});
}
function getPgConfig(config) {
    return {
        host: config.get('DB_HOST'),
        user: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        port: config.get('DB_PORT')
    };
}
function validateDevNodeEnv(env, action) {
    if (!env) {
        return 'NODE_ENV must be set';
    }
    if (env !== 'development' && env !== 'test' && process.env.WARTHOG_DB_OVERRIDE !== 'true') {
        return "Cannot " + action + " database without setting WARTHOG_DB_OVERRIDE environment variable to 'true'";
    }
    return '';
}
//# sourceMappingURL=db-extension.js.map