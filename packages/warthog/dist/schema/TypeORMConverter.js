"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityToOrderByEnum = exports.entityToCreateManyArgs = exports.entityToWhereArgs = exports.entityToWhereInput = exports.entityToUpdateInputArgs = exports.entityToUpdateInput = exports.entityToCreateInput = exports.entityToWhereUniqueInput = exports.generateClassImports = exports.generateEnumMapImports = exports.filenameToImportPath = exports.getColumnsForModel = void 0;
var typedi_1 = require("typedi");
var typeorm_1 = require("typeorm");
var metadata_1 = require("../metadata");
var type_conversion_1 = require("./type-conversion");
var ignoreBaseModels = ['BaseModel', 'BaseModelUUID'];
function getColumnsForModel(model) {
    var models = [model];
    var columns = {};
    var superProto = model.klass ? model.klass.__proto__ : null;
    while (superProto) {
        var superModel = metadata_1.getMetadataStorage().getModel(superProto.name);
        superModel && models.unshift(superModel);
        superProto = superProto.__proto__;
    }
    models.forEach(function (aModel) {
        aModel.columns.forEach(function (col) {
            columns[col.propertyName] = col;
        });
    });
    return Object.values(columns);
}
exports.getColumnsForModel = getColumnsForModel;
function filenameToImportPath(filename) {
    return filename.replace(/\.(j|t)s$/, '').replace(/\\/g, '/');
}
exports.filenameToImportPath = filenameToImportPath;
function generateEnumMapImports() {
    var imports = [];
    var enumMap = metadata_1.getMetadataStorage().enumMap;
    // Keep track of already imported items so that we don't attempt to import twice in the event the
    // enum is used in multiple models
    var imported = new Set();
    Object.keys(enumMap).forEach(function (tableName) {
        Object.keys(enumMap[tableName]).forEach(function (columnName) {
            var enumColumn = enumMap[tableName][columnName];
            if (imported.has(enumColumn.name)) {
                return;
            }
            imported.add(enumColumn.name);
            var filename = filenameToImportPath(enumColumn.filename);
            imports.push("import { " + enumColumn.name + " } from '" + filename + "'\n");
            imported.add(enumColumn.name);
        });
    });
    return imports;
}
exports.generateEnumMapImports = generateEnumMapImports;
function generateClassImports() {
    var imports = [];
    var classMap = metadata_1.getMetadataStorage().classMap;
    Object.keys(classMap).forEach(function (tableName) {
        var classObj = classMap[tableName];
        var filename = filenameToImportPath(classObj.filename);
        // Need to ts-ignore here for when we export compiled code
        // otherwise, it says we can't find a declaration file for this from the compiled code
        imports.push('// @ts-ignore\n');
        imports.push("import { " + classObj.name + " } from '" + filename + "'\n");
    });
    return imports;
}
exports.generateClassImports = generateClassImports;
function entityToWhereUniqueInput(model) {
    var uniques = metadata_1.getMetadataStorage().uniquesForModel(model);
    var others = typeorm_1.getMetadataArgsStorage().uniques;
    var modelUniques = {};
    others.forEach(function (o) {
        var name = o.target.name;
        var columns = o.columns;
        if (name === model.name && columns) {
            columns.forEach(function (col) {
                modelUniques[col] = col;
            });
        }
    });
    uniques.forEach(function (unique) {
        modelUniques[unique] = unique;
    });
    var distinctUniques = Object.keys(modelUniques);
    // If there is only one unique field, it should not be nullable
    var uniqueFieldsAreNullable = distinctUniques.length > 1;
    var fieldsTemplate = '';
    var modelColumns = getColumnsForModel(model);
    modelColumns.forEach(function (column) {
        // Uniques can be from Field or Unique annotations
        if (!modelUniques[column.propertyName]) {
            return;
        }
        var nullable = uniqueFieldsAreNullable ? ', { nullable: true }' : '';
        var graphQLDataType = type_conversion_1.columnToGraphQLDataType(column);
        var tsType = type_conversion_1.columnToTypeScriptType(column);
        if (column.array) {
            tsType = tsType.concat('[]');
            graphQLDataType = "[" + graphQLDataType + "]";
        }
        fieldsTemplate += "\n        @TypeGraphQLField(() => " + graphQLDataType + nullable + ")\n        " + column.propertyName + "?: " + tsType + ";\n      ";
    });
    var superName = model.klass ? model.klass.__proto__.name : null;
    var classDeclaration = superName && !ignoreBaseModels.includes(superName)
        ? model.name + "WhereUniqueInput extends " + superName + "WhereUniqueInput"
        : model.name + "WhereUniqueInput";
    var template = "\n    @TypeGraphQLInputType()\n    export class " + classDeclaration + " {\n      " + fieldsTemplate + "\n    }\n  ";
    return template;
}
exports.entityToWhereUniqueInput = entityToWhereUniqueInput;
function entityToCreateInput(model) {
    var idsOnCreate = typedi_1.Container.get('Config').get('ALLOW_OPTIONAL_ID_ON_CREATE') === 'true';
    var fieldTemplates = '';
    if (idsOnCreate) {
        fieldTemplates += "\n      @TypeGraphQLField({ nullable: true })\n      id?: string;\n    ";
    }
    var modelColumns = getColumnsForModel(model);
    modelColumns.forEach(function (column) {
        if (!column.editable || column.readonly) {
            return;
        }
        var graphQLDataType = type_conversion_1.columnToGraphQLDataType(column);
        var nullable = column.nullable ? '{ nullable: true }' : '';
        var tsRequired = column.nullable ? '?' : '!';
        var tsType = type_conversion_1.columnToTypeScriptType(column);
        if (column.array) {
            tsType = tsType.concat('[]');
            graphQLDataType = "[" + graphQLDataType + "]";
        }
        if (columnRequiresExplicitGQLType(column)) {
            fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", " + nullable + ")\n          " + column.propertyName + tsRequired + ": " + tsType + ";\n       ";
        }
        else {
            fieldTemplates += "\n          @TypeGraphQLField(" + nullable + ")\n          " + column.propertyName + tsRequired + ": " + tsType + ";\n        ";
        }
    });
    var superName = model.klass ? model.klass.__proto__.name : null;
    var classDeclaration = superName && !ignoreBaseModels.includes(superName)
        ? model.name + "CreateInput extends " + superName + "CreateInput"
        : model.name + "CreateInput";
    return "\n    @TypeGraphQLInputType()\n    export class " + classDeclaration + " {\n      " + fieldTemplates + "\n    }\n  ";
}
exports.entityToCreateInput = entityToCreateInput;
function entityToUpdateInput(model) {
    var fieldTemplates = '';
    var modelColumns = getColumnsForModel(model);
    modelColumns.forEach(function (column) {
        if (!column.editable || column.readonly) {
            return;
        }
        // TODO: also don't allow updated foreign key fields
        // Example: photo.userId: String
        var graphQLDataType = type_conversion_1.columnToGraphQLDataType(column);
        var tsType = type_conversion_1.columnToTypeScriptType(column);
        if (column.array) {
            tsType = tsType.concat('[]');
            graphQLDataType = "[" + graphQLDataType + "]";
        }
        if (columnRequiresExplicitGQLType(column)) {
            fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n        " + column.propertyName + "?: " + tsType + ";\n      ";
        }
        else {
            fieldTemplates += "\n        @TypeGraphQLField({ nullable: true })\n        " + column.propertyName + "?: " + tsType + ";\n      ";
        }
    });
    var superName = model.klass ? model.klass.__proto__.name : null;
    var classDeclaration = superName && !ignoreBaseModels.includes(superName)
        ? model.name + "UpdateInput extends " + superName + "UpdateInput"
        : model.name + "UpdateInput";
    return "\n    @TypeGraphQLInputType()\n    export class " + classDeclaration + " {\n      " + fieldTemplates + "\n    }\n  ";
}
exports.entityToUpdateInput = entityToUpdateInput;
// Constructs required arguments needed when doing an update
function entityToUpdateInputArgs(model) {
    return "\n    @ArgsType()\n    export class " + model.name + "UpdateArgs {\n      @TypeGraphQLField() data!: " + model.name + "UpdateInput;\n      @TypeGraphQLField() where!: " + model.name + "WhereUniqueInput;\n    }\n  ";
}
exports.entityToUpdateInputArgs = entityToUpdateInputArgs;
function columnToTypes(column) {
    var graphqlType = type_conversion_1.columnToGraphQLType(column);
    var tsType = type_conversion_1.columnToTypeScriptType(column);
    return { graphqlType: graphqlType, tsType: tsType };
}
function entityToWhereInput(model) {
    var fieldTemplates = '';
    var modelColumns = getColumnsForModel(model);
    modelColumns.forEach(function (column) {
        // If user specifically says not to filter (filter: false), then don't provide where inputs
        // Also, if the columns is "write only", then it cannot therefore be read and shouldn't have filters
        if (!column.filter || column.writeonly) {
            return;
        }
        function allowFilter(op) {
            var _a;
            if (column.filter === true) {
                return true;
            }
            if (column.filter === false) {
                return false;
            }
            return !!((_a = column.filter) === null || _a === void 0 ? void 0 : _a.includes(op));
        }
        var tsType = columnToTypes(column).tsType;
        var graphQLDataType = type_conversion_1.columnToGraphQLDataType(column);
        var modelRelationsNames = metadata_1.getMetadataStorage()
            .getModelRelation(model.name)
            .map(function (rel) { return rel.propertyName; });
        // TODO: for foreign key fields, only allow the same filters as ID below
        // Example: photo.userId: String
        if (column.array) {
            fieldTemplates += "\n        @TypeGraphQLField(() => [" + graphQLDataType + "],{ nullable: true })\n        " + column.propertyName + "_containsAll?: [" + tsType + "];\n\n        @TypeGraphQLField(() => [" + graphQLDataType + "],{ nullable: true })\n        " + column.propertyName + "_containsNone?: [" + tsType + "];\n\n        @TypeGraphQLField(() => [" + graphQLDataType + "],{ nullable: true })\n        " + column.propertyName + "_containsAny?: [" + tsType + "];\n      ";
        }
        else if (column.type === 'id' && !modelRelationsNames.includes(column.propertyName)) {
            var graphQlType = 'ID';
            if (allowFilter('eq')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQlType + ",{ nullable: true })\n          " + column.propertyName + "_eq?: string;\n        ";
            }
            if (allowFilter('in')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => [" + graphQlType + "], { nullable: true })\n        " + column.propertyName + "_in?: string[];\n        ";
            }
        }
        else if (column.type === 'boolean') {
            if (allowFilter('eq')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ",{ nullable: true })\n        " + column.propertyName + "_eq?: Boolean;\n        ";
            }
            // V3: kill the boolean "in" clause
            if (allowFilter('in')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => [" + graphQLDataType + "], { nullable: true })\n        " + column.propertyName + "_in?: Boolean[];\n      ";
            }
        }
        else if (column.type === 'string' || column.type === 'email') {
            // TODO: do we need NOT?
            // `${column.propertyName}_not`
            if (allowFilter('eq')) {
                fieldTemplates += "\n          @TypeGraphQLField({ nullable: true })\n          " + column.propertyName + "_eq?: " + tsType + ";\n        ";
            }
            if (allowFilter('contains')) {
                fieldTemplates += "\n          @TypeGraphQLField({ nullable: true })\n          " + column.propertyName + "_contains?: " + tsType + ";\n        ";
            }
            if (allowFilter('startsWith')) {
                fieldTemplates += "\n          @TypeGraphQLField({ nullable: true })\n          " + column.propertyName + "_startsWith?: " + tsType + ";\n        ";
            }
            if (allowFilter('endsWith')) {
                fieldTemplates += "\n          @TypeGraphQLField({ nullable: true })\n          " + column.propertyName + "_endsWith?: " + tsType + ";\n        ";
            }
            if (allowFilter('in')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => [" + graphQLDataType + "], { nullable: true })\n          " + column.propertyName + "_in?: " + tsType + "[];\n      ";
            }
        }
        else if (column.type === 'float' || column.type === 'integer' || column.type === 'numeric') {
            if (allowFilter('eq')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n        " + column.propertyName + "_eq?: " + tsType + ";\n      ";
            }
            if (allowFilter('gt')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n        " + column.propertyName + "_gt?: " + tsType + ";\n      ";
            }
            if (allowFilter('gte')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n        " + column.propertyName + "_gte?: " + tsType + ";\n      ";
            }
            if (allowFilter('lt')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n        " + column.propertyName + "_lt?: " + tsType + ";\n      ";
            }
            if (allowFilter('lte')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n        " + column.propertyName + "_lte?: " + tsType + ";\n      ";
            }
            if (allowFilter('in')) {
                fieldTemplates += "\n        @TypeGraphQLField(() => [" + graphQLDataType + "], { nullable: true })\n        " + column.propertyName + "_in?: " + tsType + "[];\n      ";
            }
        }
        else if (column.type === 'date' || column.type === 'datetime' || column.type === 'dateonly') {
            // I really don't like putting this magic here, but it has to go somewhere
            // This deletedAt_all turns off the default filtering of soft-deleted items
            if (column.propertyName === 'deletedAt') {
                fieldTemplates += "\n        @TypeGraphQLField({ nullable: true })\n          deletedAt_all?: Boolean;\n        ";
            }
            if (allowFilter('eq')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_eq?: " + tsType + ";\n        ";
            }
            if (allowFilter('lt')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_lt?: " + tsType + ";\n        ";
            }
            if (allowFilter('lte')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_lte?: " + tsType + ";\n        ";
            }
            if (allowFilter('gt')) {
                fieldTemplates += "   \n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_gt?: " + tsType + ";\n        ";
            }
            if (allowFilter('gte')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_gte?: " + tsType + ";\n      ";
            }
        }
        else if (column.type === 'enum') {
            if (allowFilter('eq')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_eq?: " + graphQLDataType + ";\n      ";
            }
            if (allowFilter('in')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => [" + graphQLDataType + "], { nullable: true })\n          " + column.propertyName + "_in?: " + graphQLDataType + "[];\n      ";
            }
        }
        else if (column.type === 'json') {
            fieldTemplates += "\n        @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })\n        " + column.propertyName + "_json?: JsonObject;\n      ";
        }
        else if (column.type === 'bytea') {
            if (allowFilter('eq')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => " + graphQLDataType + ", { nullable: true })\n          " + column.propertyName + "_eq?: " + tsType + ";\n        ";
            }
            if (allowFilter('in')) {
                fieldTemplates += "\n          @TypeGraphQLField(() => [" + graphQLDataType + "], { nullable: true })\n          " + column.propertyName + "_in?: " + tsType + "[];\n      ";
            }
        }
        if (column.isArray) {
            var graphQlType = "[" + graphQLDataType + "]";
            fieldTemplates = "\n        @TypeGraphQLField(() => " + graphQlType + ",{ nullable: true })\n        " + column.propertyName + "_eq?: string[];\n      ";
            fieldTemplates += "\n        @TypeGraphQLField(() => [" + graphQlType + "], { nullable: true })\n        " + column.propertyName + "_in?: string[];\n        ";
        }
    });
    var superName = model.klass ? model.klass.__proto__.name : null;
    var classDeclaration = superName && !ignoreBaseModels.includes(superName)
        ? model.name + "WhereInput extends " + superName + "WhereInput"
        : model.name + "WhereInput";
    /////// cross filters ///////
    var modelRelations = metadata_1.getMetadataStorage().getModelRelation(model.name);
    modelRelations.forEach(function (m) {
        if (m.isList) {
            fieldTemplates += "\n    @TypeGraphQLField(() => " + m.relModelName + "WhereInput, { nullable: true })\n    " + m.propertyName + "_none?: " + m.relModelName + "WhereInput\n\n    @TypeGraphQLField(() => " + m.relModelName + "WhereInput, { nullable: true })\n    " + m.propertyName + "_some?: " + m.relModelName + "WhereInput\n\n    @TypeGraphQLField(() => " + m.relModelName + "WhereInput, { nullable: true })\n    " + m.propertyName + "_every?: " + m.relModelName + "WhereInput\n    ";
        }
        else {
            fieldTemplates += "\n    @TypeGraphQLField(() => " + m.relModelName + "WhereInput, { nullable: true })\n    " + m.propertyName + "?: " + m.relModelName + "WhereInput\n    ";
        }
    });
    return "\n    @TypeGraphQLInputType()\n    export class " + classDeclaration + " {\n      " + fieldTemplates + "\n      @TypeGraphQLField(() => " + model.name + "WhereInput, { nullable: true })\n      AND?: [" + model.name + "WhereInput];\n\n      @TypeGraphQLField(() => " + model.name + "WhereInput, { nullable: true })\n      OR?: [" + model.name + "WhereInput];\n    }\n  ";
}
exports.entityToWhereInput = entityToWhereInput;
function entityToWhereArgs(model) {
    return "\n    @ArgsType()\n    export class " + model.name + "WhereArgs extends PaginationArgs {\n      @TypeGraphQLField(() => " + model.name + "WhereInput, { nullable: true })\n      where?: " + model.name + "WhereInput;\n\n      @TypeGraphQLField(() => " + model.name + "OrderByEnum, { nullable: true })\n      orderBy?: " + model.name + "OrderByEnum[];\n    }\n  ";
}
exports.entityToWhereArgs = entityToWhereArgs;
// Note: it would be great to inject a single `Arg` with the [model.nameCreateInput] array arg,
// but that is not allowed by TypeGraphQL
function entityToCreateManyArgs(model) {
    return "\n    @ArgsType()\n    export class " + model.name + "CreateManyArgs {\n      @TypeGraphQLField(() => [" + model.name + "CreateInput])\n      data!: " + model.name + "CreateInput[];\n    }\n  ";
}
exports.entityToCreateManyArgs = entityToCreateManyArgs;
function entityToOrderByEnum(model) {
    var fieldsTemplate = '';
    var modelColumns = getColumnsForModel(model);
    modelColumns.forEach(function (column) {
        if (column.type === 'json') {
            return;
        }
        // If user says this is not sortable, then don't allow sorting
        // Also, if the column is "write only", therefore it cannot be read and shouldn't be sortable
        // Also, doesn't make sense to sort arrays
        if (column.sort && !column.writeonly && !column.array) {
            fieldsTemplate += "\n        " + column.propertyName + "_ASC = '" + column.propertyName + "_ASC',\n        " + column.propertyName + "_DESC = '" + column.propertyName + "_DESC',\n      ";
        }
    });
    return "\n    export enum " + model.name + "OrderByEnum {\n      " + fieldsTemplate + "\n    }\n\n    registerEnumType(" + model.name + "OrderByEnum, {\n      name: '" + model.name + "OrderByInput'\n    });\n  ";
}
exports.entityToOrderByEnum = entityToOrderByEnum;
function columnRequiresExplicitGQLType(column) {
    return (column.enum ||
        column.array ||
        column.type === 'json' ||
        column.type === 'id' ||
        column.type === 'date' ||
        column.type === 'datetime' ||
        column.type === 'dateonly');
}
//# sourceMappingURL=TypeORMConverter.js.map