import { GraphQLEnumType } from 'graphql';
import { ColumnType, WhereOperator } from '../torm';
import { Config } from '../core';
export declare type FieldType = 'boolean' | 'date' | 'dateonly' | 'datetime' | 'email' | 'enum' | 'float' | 'id' | 'integer' | 'json' | 'numeric' | 'string' | 'bytea';
export interface DecoratorCommonOptions {
    apiOnly?: boolean;
    dbOnly?: boolean;
    description?: string;
    editable?: boolean;
    filter?: boolean | WhereOperator[];
    nullable?: boolean;
    readonly?: boolean;
    sort?: boolean;
    writeonly?: boolean;
    isArray?: boolean;
}
export interface ColumnMetadata extends DecoratorCommonOptions {
    type: FieldType;
    propertyName: string;
    dataType?: ColumnType;
    default?: any;
    gqlFieldType?: Function;
    enum?: GraphQLEnumType;
    enumName?: string;
    unique?: boolean;
    array?: boolean;
}
export declare type ColumnOptions = Partial<ColumnMetadata>;
export interface RelationMetadata {
    relModelName: string;
    propertyName: string;
    isList: boolean;
}
export interface ModelMetadata {
    abstract?: boolean;
    filename?: string;
    klass?: any;
    name: string;
    columns: ColumnMetadata[];
    apiOnly?: boolean;
    dbOnly?: boolean;
    relations: RelationMetadata[];
}
export declare class MetadataStorage {
    readonly config?: Config | undefined;
    enumMap: {
        [table: string]: {
            [column: string]: any;
        };
    };
    classMap: {
        [table: string]: any;
    };
    models: {
        [table: string]: ModelMetadata;
    };
    interfaces: string[];
    baseColumns: ColumnMetadata[];
    decoratorDefaults: Partial<ColumnMetadata>;
    constructor(config?: Config | undefined);
    addClass(name: string, klass: any, filename: string): void;
    addModel(name: string, klass: any, filename: string, options?: Partial<ModelMetadata>): void;
    addEnum(modelName: string, columnName: string, enumName: string, enumValues: any, filename: string, options: ColumnOptions): void;
    getModelRelation(modelName: string): RelationMetadata[];
    addModelRelation(options: any): void;
    getModels(): {
        [table: string]: ModelMetadata;
    };
    getModel(name: string): ModelMetadata;
    getEnum(modelName: string, columnName: string): any;
    addField(type: FieldType, modelName: string, columnName: string, options?: Partial<ColumnMetadata>): void;
    uniquesForModel(model: ModelMetadata): string[];
    addInterfaceType(name: string): void;
}
export declare function getMetadataStorage(): MetadataStorage;
