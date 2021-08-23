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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Binding = exports.getBindingError = exports.getOriginalError = exports.generateBindingFile = exports.getRemoteBinding = exports.RemoteBinding = exports.Link = void 0;
var apollo_link_error_1 = require("apollo-link-error");
var apollo_link_http_1 = require("apollo-link-http");
var fetch = require("cross-fetch");
var fs = require("fs");
var graphql_1 = require("graphql");
var graphql_binding_1 = require("graphql-binding");
Object.defineProperty(exports, "Binding", { enumerable: true, get: function () { return graphql_binding_1.Binding; } });
var graphql_tools_1 = require("graphql-tools");
var path = require("path");
var core_1 = require("../core");
var Link = /** @class */ (function (_super) {
    __extends(Link, _super);
    function Link(uri, options) {
        var _this = this;
        var headers = __assign({}, options);
        if (headers.token) {
            headers.Authorization = "Bearer " + headers.token;
            delete headers.token;
        }
        core_1.logger.debug('headers', headers);
        _this = _super.call(this, {
            // TODO: cross-fetch library does not play nicely with TS
            fetch: fetch,
            headers: headers,
            uri: uri
        }) || this;
        return _this;
    }
    return Link;
}(apollo_link_http_1.HttpLink));
exports.Link = Link;
var RemoteBinding = /** @class */ (function (_super) {
    __extends(RemoteBinding, _super);
    function RemoteBinding(httpLink, typeDefs) {
        var _this = this;
        // Workaround for issue with graphql-tools
        // See https://github.com/graphql-binding/graphql-binding/issues/173#issuecomment-446366548
        var errorLink = apollo_link_error_1.onError(function (args) {
            if (args.graphQLErrors && args.graphQLErrors.length === 1) {
                args.response.errors = args.graphQLErrors.concat(new graphql_1.GraphQLError(''));
            }
        });
        var schema = graphql_tools_1.makeRemoteExecutableSchema({
            link: errorLink.concat(httpLink),
            schema: typeDefs
        });
        core_1.logger.debug('schema', JSON.stringify(schema));
        _this = _super.call(this, { schema: schema }) || this;
        return _this;
    }
    return RemoteBinding;
}(graphql_binding_1.Binding));
exports.RemoteBinding = RemoteBinding;
function getRemoteBinding(endpoint, options) {
    return __awaiter(this, void 0, void 0, function () {
        var link, introspectionResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!endpoint) {
                        throw new Error('getRemoteBinding: endpoint is required');
                    }
                    core_1.logger.debug('getRemoteBinding', endpoint, options);
                    link = new Link(endpoint, options);
                    return [4 /*yield*/, graphql_tools_1.introspectSchema(link)];
                case 1:
                    introspectionResult = _a.sent();
                    core_1.logger.debug('introspectionResult', JSON.stringify(introspectionResult));
                    return [2 /*return*/, new RemoteBinding(link, graphql_1.printSchema(introspectionResult))];
            }
        });
    });
}
exports.getRemoteBinding = getRemoteBinding;
function generateBindingFile(inputSchemaPath, outputBindingFile) {
    return __awaiter(this, void 0, void 0, function () {
        var sdl, schema, generatorOptions, generatorInstance, code;
        return __generator(this, function (_a) {
            core_1.logger.debug('generateBindingFile:start');
            sdl = fs.readFileSync(path.resolve(inputSchemaPath), 'utf-8');
            schema = graphql_1.buildSchema(sdl);
            generatorOptions = {
                inputSchemaPath: path.resolve(inputSchemaPath),
                isDefaultExport: false,
                outputBindingPath: path.resolve(outputBindingFile),
                schema: schema
            };
            generatorInstance = new graphql_binding_1.TypescriptGenerator(generatorOptions);
            code = "import 'graphql-import-node'; // Needed so you can import *.graphql files \n\n" +
                generatorInstance
                    .render()
                    .replace('export type JSONObject = string', "\n    export type JsonValue = JsonPrimitive | JsonObject | JsonArray;\n\n    export type JsonPrimitive = string | number | boolean | null | {};\n    \n        // eslint-disable-next-line @typescript-eslint/no-empty-interface\n    export interface JsonArray extends Array<JsonValue> {}\n    \n    export type JsonObject = { [member: string]: JsonValue };\n\n    export type JSONObject = JsonObject;\n  ")
                    .replace('({ schema })', '({ schema: schema as any })');
            fs.writeFileSync(outputBindingFile, code);
            core_1.logger.debug('generateBindingFile:end');
            return [2 /*return*/];
        });
    });
}
exports.generateBindingFile = generateBindingFile;
function getOriginalError(error) {
    if (error.originalError) {
        return getOriginalError(error.originalError);
    }
    if (error.errors) {
        return error.errors.map(getOriginalError)[0];
    }
    return error;
}
exports.getOriginalError = getOriginalError;
function getBindingError(err) {
    var error = getOriginalError(err);
    if (error &&
        error.extensions &&
        error.extensions.exception &&
        error.extensions.exception.validationErrors) {
        error.extensions.exception.validationErrors.forEach(function (item) {
            error.validationErrors = error.validationErrors || {};
            error.validationErrors[item.property] = item.constraints;
        });
    }
    return error;
}
exports.getBindingError = getBindingError;
//# sourceMappingURL=binding.js.map