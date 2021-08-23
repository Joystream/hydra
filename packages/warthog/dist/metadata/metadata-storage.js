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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataStorage = exports.MetadataStorage = void 0;
var typedi_1 = require("typedi");
var core_1 = require("../core");
var MetadataStorage = /** @class */ (function () {
    function MetadataStorage(config) {
        this.config = config;
        this.enumMap = {};
        this.classMap = {};
        this.models = {};
        this.interfaces = [];
        if (!config) {
            config = typedi_1.Container.get('Config');
        }
        config = config; // `config` needs to be optional in the constructor for the global instantiation below
        this.decoratorDefaults = {
            apiOnly: false,
            dbOnly: false,
            editable: true,
            // `true` by default, provide opt-out for backward compatability
            // V3: make this false by default
            filter: config.get('FILTER_BY_DEFAULT') !== 'false',
            nullable: false,
            readonly: false,
            sort: config.get('FILTER_BY_DEFAULT') !== 'false',
            unique: false,
            writeonly: false
        };
        this.baseColumns = [
            {
                propertyName: 'id',
                type: 'id',
                filter: true,
                nullable: false,
                sort: false,
                unique: true,
                editable: false
            },
            {
                propertyName: 'createdAt',
                type: 'date',
                editable: false,
                filter: true,
                nullable: false,
                sort: true,
                unique: false
            },
            {
                propertyName: 'createdById',
                type: 'id',
                editable: false,
                filter: true,
                nullable: false,
                sort: false,
                unique: false
            },
            {
                propertyName: 'updatedAt',
                type: 'date',
                editable: false,
                filter: true,
                nullable: true,
                sort: true,
                unique: false
            },
            {
                propertyName: 'updatedById',
                type: 'id',
                editable: false,
                filter: true,
                nullable: true,
                sort: false,
                unique: false
            },
            {
                propertyName: 'deletedAt',
                type: 'date',
                editable: false,
                filter: true,
                nullable: true,
                sort: true,
                unique: false
            },
            {
                propertyName: 'deletedById',
                type: 'id',
                editable: false,
                filter: true,
                nullable: true,
                sort: false,
                unique: false
            },
            {
                type: 'integer',
                propertyName: 'version',
                editable: false,
                filter: false,
                nullable: false,
                sort: false,
                unique: false
            }
        ];
    }
    // Adds a class so that we can import it into classes.ts
    // This is typically used when adding a strongly typed JSON column
    // using JSONField with a gqlFieldType
    MetadataStorage.prototype.addClass = function (name, klass, filename) {
        this.classMap[name] = {
            filename: filename,
            klass: klass,
            name: name
        };
    };
    MetadataStorage.prototype.addModel = function (name, klass, filename, options) {
        if (options === void 0) { options = {}; }
        if (this.interfaces.indexOf(name) > -1) {
            return; // Don't add interface types to model list
        }
        this.classMap[name] = {
            filename: filename,
            klass: klass,
            name: name
        };
        // Just add `klass` and `filename` to the model object
        this.models[name] = __assign(__assign(__assign({}, this.models[name]), { klass: klass, filename: filename }), options);
    };
    MetadataStorage.prototype.addEnum = function (modelName, columnName, enumName, enumValues, filename, options) {
        this.enumMap[modelName] = this.enumMap[modelName] || {};
        this.enumMap[modelName][columnName] = {
            enumeration: enumValues,
            filename: filename,
            name: enumName
        };
        // the enum needs to be passed so that it can be bound to column metadata
        options.enum = enumValues;
        options.enumName = enumName;
        this.addField('enum', modelName, columnName, options);
    };
    MetadataStorage.prototype.getModelRelation = function (modelName) {
        return this.models[modelName].relations;
    };
    MetadataStorage.prototype.addModelRelation = function (options) {
        var modelName = options.modelName, relModelName = options.relModelName, propertyName = options.propertyName, isList = options.isList;
        if (!modelName || !relModelName || !propertyName || isList === undefined) {
            throw Error("Missing decorator options for " + modelName + ". Make sure you provide all the required props(modelName, relModelName, propertyName, isList)");
        }
        if (!this.models[modelName]) {
            this.models[modelName] = {
                name: modelName,
                columns: Array.from(this.baseColumns),
                relations: []
            };
        }
        this.models[modelName].relations.push({
            relModelName: relModelName,
            propertyName: propertyName,
            isList: isList
        });
    };
    MetadataStorage.prototype.getModels = function () {
        return this.models;
    };
    MetadataStorage.prototype.getModel = function (name) {
        return this.models[name];
    };
    MetadataStorage.prototype.getEnum = function (modelName, columnName) {
        if (!this.enumMap[modelName]) {
            return undefined;
        }
        return this.enumMap[modelName][columnName] || undefined;
    };
    MetadataStorage.prototype.addField = function (type, modelName, columnName, options) {
        if (options === void 0) { options = {}; }
        if (this.interfaces.indexOf(modelName) > -1) {
            return; // Don't add interfaces
        }
        if (!this.models[modelName]) {
            this.models[modelName] = {
                name: modelName,
                columns: Array.from(this.baseColumns),
                relations: []
            };
        }
        this.models[modelName].columns.push(__assign(__assign({ type: type, propertyName: columnName }, this.decoratorDefaults), options));
    };
    MetadataStorage.prototype.uniquesForModel = function (model) {
        return model.columns.filter(function (column) { return column.unique; }).map(function (column) { return column.propertyName; });
    };
    MetadataStorage.prototype.addInterfaceType = function (name) {
        this.addModel(name, null, '', { abstract: true });
    };
    MetadataStorage = __decorate([
        typedi_1.Service('MetadataStorage'),
        __param(0, typedi_1.Inject('Config')),
        __metadata("design:paramtypes", [core_1.Config])
    ], MetadataStorage);
    return MetadataStorage;
}());
exports.MetadataStorage = MetadataStorage;
function getMetadataStorage() {
    if (!global.WarthogMetadataStorage) {
        // Since we can't use DI to inject this, just call into the container directly
        global.WarthogMetadataStorage = typedi_1.Container.get('MetadataStorage');
    }
    return global.WarthogMetadataStorage;
}
exports.getMetadataStorage = getMetadataStorage;
//# sourceMappingURL=metadata-storage.js.map