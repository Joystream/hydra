"use strict";
// TODO-MVP: Add custom scalars such as graphql-iso-date
// import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = exports.Server = void 0;
var apollo_server_express_1 = require("apollo-server-express");
var express = require("express");
var graphql_1 = require("graphql");
var graphql_scalars_1 = require("graphql-scalars");
var open = require('open'); // eslint-disable-line @typescript-eslint/no-var-requires
var type_graphql_1 = require("type-graphql"); // formatArgumentValidationError
var typedi_1 = require("typedi");
var typeorm_1 = require("typeorm");
// import { IQueryTemplate } from '@apollographql/graphql-playground-react';
var logger_1 = require("../core/logger");
var gql_1 = require("../gql");
var middleware_1 = require("../middleware");
var torm_1 = require("../torm");
var code_generator_1 = require("./code-generator");
var config_1 = require("./config");
var Debug = require("debug");
var path = require("path");
var debug = Debug('warthog:server');
var Server = /** @class */ (function () {
    function Server(appOptions, dbOptions) {
        if (dbOptions === void 0) { dbOptions = {}; }
        this.appOptions = appOptions;
        this.dbOptions = dbOptions;
        if (typeof this.appOptions.host !== 'undefined') {
            process.env.WARTHOG_APP_HOST = this.appOptions.host;
            // When we move to v2.0 we'll officially deprecate these config values in favor of ENV vars
            // throw new Error(
            //   '`host` option has been removed, please set `WARTHOG_APP_HOST` environment variable instead'
            // );
        }
        if (typeof this.appOptions.port !== 'undefined') {
            process.env.WARTHOG_APP_PORT = this.appOptions.port.toString();
        }
        if (typeof this.appOptions.generatedFolder !== 'undefined') {
            process.env.WARTHOG_GENERATED_FOLDER = this.appOptions.generatedFolder;
        }
        if (typeof this.appOptions.introspection !== 'undefined') {
            process.env.WARTHOG_INTROSPECTION = this.appOptions.introspection ? 'true' : 'false';
        }
        if (typeof this.appOptions.openPlayground !== 'undefined') {
            process.env.WARTHOG_AUTO_OPEN_PLAYGROUND = this.appOptions.openPlayground ? 'true' : 'false';
        }
        if (typeof this.appOptions.autoGenerateFiles !== 'undefined') {
            process.env.WARTHOG_AUTO_GENERATE_FILES = this.appOptions.autoGenerateFiles
                ? 'true'
                : 'false';
        }
        // Ensure that Warthog, TypeORM and TypeGraphQL are all using the same typedi container
        this.container = this.appOptions.container || typedi_1.Container;
        typeorm_1.useContainer(this.container); // TODO: fix any
        this.authChecker = this.appOptions.authChecker;
        this.bodyParserConfig = this.appOptions.bodyParserConfig;
        this.apolloConfig = this.appOptions.apolloConfig || {};
        this.logger = this.getLogger();
        // NOTE: this should be after we hard-code the WARTHOG_ env vars above because we want the config
        // module to think they were set by the user
        this.config = new config_1.Config({ container: this.container, logger: this.logger });
        this.expressApp = this.appOptions.expressApp || express();
        if (!process.env.NODE_ENV) {
            throw new Error("NODE_ENV must be set - use 'development' locally");
        }
    }
    Server.prototype.getLogger = function () {
        if (this.appOptions.logger) {
            return this.appOptions.logger;
            // } else if (Container.has('warthog.logger')) {
            //   return Container.get('warthog.logger');
        }
        return logger_1.logger;
    };
    Server.prototype.establishDBConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.connection) return [3 /*break*/, 2];
                        debug('establishDBConnection:start');
                        _a = this;
                        return [4 /*yield*/, torm_1.createDBConnection(this.dbOptions)];
                    case 1:
                        _a.connection = _b.sent();
                        debug('establishDBConnection:end');
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.connection];
                }
            });
        });
    };
    Server.prototype.getServerUrl = function () {
        return this.config.get('APP_PROTOCOL') + "://" + this.config.get('APP_HOST') + ":" + this.config.get('APP_PORT');
    };
    Server.prototype.getGraphQLServerUrl = function () {
        return this.getServerUrl() + "/graphql";
    };
    Server.prototype.getBinding = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var binding, error_1, messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gql_1.getRemoteBinding(this.getGraphQLServerUrl(), __assign({ origin: 'warthog' }, options))];
                    case 1:
                        binding = _a.sent();
                        return [2 /*return*/, binding];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.result && error_1.result.errors) {
                            messages = error_1.result.errors.map(function (item) { return item.message; });
                            throw new Error(JSON.stringify(messages));
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.buildGraphQLSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.schema) return [3 /*break*/, 2];
                        debug('server:buildGraphQLSchema:start');
                        _a = this;
                        return [4 /*yield*/, type_graphql_1.buildSchema({
                                authChecker: this.authChecker,
                                scalarsMap: [
                                    {
                                        type: 'ID',
                                        scalar: graphql_1.GraphQLID
                                    },
                                    // Note: DateTime already included in type-graphql
                                    {
                                        type: 'DateOnlyString',
                                        scalar: graphql_scalars_1.DateResolver
                                    }
                                ],
                                container: this.container,
                                // TODO: ErrorLoggerMiddleware
                                globalMiddlewares: __spreadArray([middleware_1.DataLoaderMiddleware], (this.appOptions.middlewares || [])),
                                resolvers: this.config.get('RESOLVERS_PATH'),
                                // TODO: scalarsMap: [{ type: GraphQLDate, scalar: GraphQLDate }]
                                validate: this.config.get('VALIDATE_RESOLVERS') === 'true',
                                pubSub: this.appOptions.pubSub
                            })];
                    case 1:
                        _a.schema = _b.sent();
                        debug('server:buildGraphQLSchema:end');
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.schema];
                }
            });
        });
    };
    Server.prototype.generateFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug('start:generateFiles:start');
                        return [4 /*yield*/, new code_generator_1.CodeGenerator(this.config.get('GENERATED_FOLDER'), this.config.get('DB_ENTITIES'), {
                                resolversPath: this.config.get('RESOLVERS_PATH'),
                                validateResolvers: this.config.get('VALIDATE_RESOLVERS') === 'true',
                                warthogImportPath: this.config.get('MODULE_IMPORT_PATH')
                            }).generate()];
                    case 1:
                        _a.sent();
                        debug('start:generateFiles:end');
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.startHttpServer = function (url) {
        var _this = this;
        var keepAliveTimeout = Number(this.config.get('WARTHOG_KEEP_ALIVE_TIMEOUT_MS'));
        var headersTimeout = Number(this.config.get('WARTHOG_HEADERS_TIMEOUT_MS'));
        this.httpServer = this.expressApp.listen({ port: this.config.get('APP_PORT') }, function () {
            return _this.logger.info("\uD83D\uDE80 Server ready at " + url);
        });
        this.httpServer.keepAliveTimeout = keepAliveTimeout;
        this.httpServer.headersTimeout = headersTimeout;
    };
    Server.prototype.start = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var contextGetter, playgroundAssetsUrl, playgroundOption, introspectionOption, pathToPlaygroundAssets, url, process_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        debug('start:start');
                        return [4 /*yield*/, this.establishDBConnection()];
                    case 1:
                        _c.sent();
                        if (!(this.config.get('AUTO_GENERATE_FILES') === 'true')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateFiles()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.buildGraphQLSchema()];
                    case 4:
                        _c.sent();
                        contextGetter = this.appOptions.context ||
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, {}];
                                });
                            }); });
                        debug('start:ApolloServerAllocation:start');
                        playgroundAssetsUrl = '/@apollographql/graphql-playground-react/build';
                        playgroundOption = this.config.get('PLAYGROUND') === 'true'
                            ? {
                                playground: {
                                    // this makes playground files to be served locally
                                    version: ((_a = this.appOptions.playgroundConfig) === null || _a === void 0 ? void 0 : _a.version) || '',
                                    cdnUrl: ((_b = this.appOptions.playgroundConfig) === null || _b === void 0 ? void 0 : _b.cdnUrl) || '',
                                    // pass custom query templates to playground
                                    // queryTemplates: this.appOptions.playgroundConfig?.queryTemplates || []
                                }
                            }
                            : {};
                        introspectionOption = this.config.get('INTROSPECTION') === 'true' ? { introspection: true } : {};
                        this.graphQLServer = new apollo_server_express_1.ApolloServer(__assign(__assign(__assign(__assign({ context: function (options) { return __awaiter(_this, void 0, void 0, function () {
                                var consumerCtx;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, contextGetter(options.req)];
                                        case 1:
                                            consumerCtx = _a.sent();
                                            return [2 /*return*/, __assign({ connection: this.connection, dataLoader: {
                                                        initialized: false,
                                                        loaders: {}
                                                    }, request: options.req }, consumerCtx)];
                                    }
                                });
                            }); } }, playgroundOption), introspectionOption), { schema: this.schema }), this.apolloConfig));
                        debug('start:ApolloServerAllocation:end');
                        this.expressApp.use('/health', middleware_1.healthCheckMiddleware);
                        pathToPlaygroundAssets = path.dirname(require.resolve('@apollographql/graphql-playground-react/package.json')) +
                            '/build';
                        this.expressApp.use(playgroundAssetsUrl, express.static(pathToPlaygroundAssets));
                        if (this.appOptions.onBeforeGraphQLMiddleware) {
                            this.appOptions.onBeforeGraphQLMiddleware(this.expressApp);
                        }
                        debug('start:applyMiddleware:start');
                        this.graphQLServer.applyMiddleware({
                            app: this.expressApp,
                            bodyParserConfig: this.bodyParserConfig,
                            path: '/graphql'
                        });
                        debug('start:applyMiddleware:end');
                        if (this.appOptions.onAfterGraphQLMiddleware) {
                            this.appOptions.onAfterGraphQLMiddleware(this.expressApp);
                        }
                        url = this.getGraphQLServerUrl();
                        this.startHttpServer(url);
                        // Open up websocket connection for subscriptions
                        if (this.config.get('SUBSCRIPTIONS') === 'true') {
                            this.graphQLServer.installSubscriptionHandlers(this.httpServer);
                        }
                        // Open playground in the browser
                        if (this.config.get('AUTO_OPEN_PLAYGROUND') === 'true') {
                            process_1 = open(url, { wait: false });
                            debug('process', process_1);
                        }
                        debug('start:end');
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Server.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Stopping HTTP Server');
                        this.httpServer.close();
                        this.logger.info('Closing DB Connection');
                        return [4 /*yield*/, this.connection.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Server;
}());
exports.Server = Server;
// Backwards compatability.  This was renamed.
exports.App = Server;
//# sourceMappingURL=server.js.map