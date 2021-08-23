"use strict";
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
var cosmiconfig_1 = require("cosmiconfig");
var path = require("path");
var prettier = require("prettier");
exports.default = {
    name: 'generate',
    alias: ['g'],
    run: function (toolbox) { return __awaiter(void 0, void 0, void 0, function () {
        var load, _a, options, first, array, error, supplant, config, name, names, cliGeneratePath, destFolder, warthogPathInGeneratedFolder, generatedPath, generatedFolderRelativePath, warthogPathInSourceFiles, warthogAbsolutePath, getRelativePathForModel, props;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    load = toolbox.config.load, _a = toolbox.parameters, options = _a.options, first = _a.first, array = _a.array, error = toolbox.print.error, supplant = toolbox.string.supplant;
                    config = load();
                    name = first;
                    if (!name) {
                        return [2 /*return*/, error('name is required')];
                    }
                    names = {
                        className: toolbox.strings.pascalCase(name),
                        camelName: toolbox.strings.camelCase(name),
                        kebabName: toolbox.strings.kebabCase(name),
                        // Not proper pluralization, but good enough and easy to fix in generated code
                        camelNamePlural: toolbox.strings.camelCase(name) + 's'
                    };
                    cliGeneratePath = options.folder ||
                        path.join(config.get('ROOT_FOLDER'), '/', config.get('CLI_GENERATE_PATH'), '/');
                    destFolder = supplant(cliGeneratePath, names);
                    warthogPathInGeneratedFolder = config.get('MODULE_IMPORT_PATH');
                    generatedPath = config.get('GENERATED_FOLDER');
                    generatedFolderRelativePath = path.relative(destFolder, generatedPath);
                    // If we're generating inside of an external project, we'll just import from 'warthog'
                    if (warthogPathInGeneratedFolder === 'warthog') {
                        warthogPathInSourceFiles = 'warthog';
                    }
                    else {
                        warthogAbsolutePath = path.join(generatedPath, warthogPathInGeneratedFolder);
                        warthogPathInSourceFiles = path.relative(destFolder, warthogAbsolutePath);
                    }
                    getRelativePathForModel = function (name) {
                        // relative import path
                        return path.join('..', toolbox.strings.kebabCase(name), toolbox.strings.camelCase(name) + ".model");
                    };
                    props = __assign(__assign({}, names), { pascalCase: toolbox.strings.pascalCase, camelCase: toolbox.strings.camelCase, fields: array ? processFields(array.slice(1)) : [], generatedFolderRelativePath: generatedFolderRelativePath, warthogPathInSourceFiles: warthogPathInSourceFiles, getRelativePathForModel: getRelativePathForModel });
                    return [4 /*yield*/, generateFile(toolbox, props, 'generate/model.ts.ejs', destFolder, names.kebabName + ".model.ts")];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, generateFile(toolbox, props, 'generate/service.ts.ejs', destFolder, names.kebabName + ".service.ts")];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, generateFile(toolbox, props, 'generate/resolver.ts.ejs', destFolder, names.kebabName + ".resolver.ts")];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); }
};
function generateFile(toolbox, props, template, destFolder, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var target, explorer, config, generated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = path.join(destFolder, '/', filename);
                    explorer = cosmiconfig_1.cosmiconfig('prettier');
                    return [4 /*yield*/, explorer.search()];
                case 1:
                    config = _a.sent();
                    return [4 /*yield*/, toolbox.template.generate({
                            template: template,
                            target: target,
                            props: props
                        })];
                case 2:
                    generated = _a.sent();
                    generated = prettier.format(generated, __assign(__assign({}, (config ? config.config : {})), { parser: 'typescript' }));
                    toolbox.filesystem.write(target, generated);
                    toolbox.print.info("Generated file at " + target);
                    return [2 /*return*/];
            }
        });
    });
}
function processFields(fields) {
    // If user doesn't pass fields, generate a single placeholder
    if (!fields.length) {
        fields = ['fieldName'];
    }
    return fields.map(function (raw) {
        var field = {};
        if (raw.endsWith('!')) {
            field.required = true;
            raw = raw.substring(0, raw.length - 1);
        }
        var parts = raw.split(':');
        if (!parts.length) {
            throw new Error('found an empty field');
        }
        // Make sure this is camel case
        field.name = parts[0];
        if (parts.length > 1) {
            // validate this is a valid type
            field.type = parts[1];
        }
        else {
            field.type = 'string';
        }
        if (parts[1] && parts[1].startsWith('array'))
            field.type = 'array';
        var typeFields = {
            bool: {
                decorator: 'BooleanField',
                tsType: 'boolean'
            },
            date: {
                decorator: 'DateField',
                tsType: 'Date'
            },
            int: {
                decorator: 'IntField',
                tsType: 'number'
            },
            float: {
                decorator: 'FloatField',
                tsType: 'number'
            },
            json: {
                decorator: 'JSONField',
                tsType: 'JsonObject'
            },
            otm: {
                decorator: 'OneToMany',
                tsType: '---'
            },
            string: {
                decorator: 'StringField',
                tsType: 'string'
            },
            numeric: {
                decorator: 'NumericField',
                tsType: 'string'
            },
            decimal: {
                decorator: 'NumericField',
                tsType: 'string'
            },
            oto: {
                decorator: 'OneToOne',
                tsType: '---'
            },
            array: {
                decorator: 'ArrayField',
                tsType: '' // will be updated with the correct type
            },
            bytes: {
                decorator: 'BytesField',
                tsType: 'Buffer'
            }
        };
        if (parts[1] && parts[1].startsWith('array')) {
            // Remove 'array' from field defination
            var typeName = parts[1].slice(5);
            var _a = getTypesForArray(typeName), dbType = _a.dbType, apiType = _a.apiType;
            field.apiType = apiType;
            field.dbType = dbType;
            typeFields[field.type].tsType = typeFields[typeName].tsType;
        }
        // TODO: validate otm fields are plural?
        field = __assign(__assign({}, field), typeFields[field.type]);
        return field;
    });
}
function getTypesForArray(typeName) {
    var graphQLFieldTypes = {
        bool: 'boolean',
        int: 'integer',
        string: 'string',
        float: 'float',
        date: 'date',
        numeric: 'numeric',
        decimal: 'numeric'
    };
    var apiType = graphQLFieldTypes[typeName];
    var dbType = apiType;
    if (dbType === 'string') {
        dbType = 'text'; // postgres doesnt have 'string'
    }
    else if (dbType === 'float') {
        dbType = 'decimal'; // postgres doesnt have 'float'
    }
    return { dbType: dbType, apiType: apiType };
}
//# sourceMappingURL=generate.js.map