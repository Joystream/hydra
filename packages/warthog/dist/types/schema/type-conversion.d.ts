import { GraphQLScalarType } from 'graphql';
import { ColumnMetadata, FieldType } from '../metadata';
declare type GraphQLCustomType = any;
export declare function columnToGraphQLType(column: ColumnMetadata): GraphQLScalarType | string | GraphQLCustomType;
export declare function columnTypeToGraphQLType(type: FieldType): GraphQLScalarType;
export declare function columnToGraphQLDataType(column: ColumnMetadata): string;
export declare function columnToTypeScriptType(column: ColumnMetadata): string;
export {};
