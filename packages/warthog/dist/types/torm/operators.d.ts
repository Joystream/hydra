import { SelectQueryBuilder } from 'typeorm';
export declare type WhereOperator = 'eq' | 'not' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'contains' | 'startsWith' | 'endsWith' | 'json';
declare type ExactWhereOperator = 'eq' | 'in';
declare type NumberWhereOperator = 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
declare type TextWhereOperator = 'eq' | 'contains' | 'startsWith' | 'endsWith' | 'in';
declare type DateGeneralWhereOperator = 'eq' | 'lt' | 'lte' | 'gt' | 'gte';
export declare type BooleanWhereOperator = ExactWhereOperator;
export declare type DateWhereOperator = DateGeneralWhereOperator;
export declare type DateOnlyWhereOperator = DateGeneralWhereOperator;
export declare type DateTimeWhereOperator = DateGeneralWhereOperator;
export declare type EmailWhereOperator = TextWhereOperator;
export declare type EnumWhereOperator = ExactWhereOperator;
export declare type FloatWhereOperator = NumberWhereOperator;
export declare type IdWhereOperator = ExactWhereOperator;
export declare type IntWhereOperator = NumberWhereOperator;
export declare type NumericWhereOperator = NumberWhereOperator;
export declare type StringWhereOperator = TextWhereOperator;
export declare function addQueryBuilderWhereItem<E>(qb: SelectQueryBuilder<E>, // query builder will be mutated (chained) in this function
parameterKey: string, // Paremeter key used in query builder
columnWithAlias: string, // ex. "user"."name"
operator: string, // ex. eq
value: any): SelectQueryBuilder<E>;
export {};
