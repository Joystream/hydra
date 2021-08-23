import { DecoratorCommonOptions } from '../metadata';
import { IdWhereOperator } from '../torm';
interface IdFieldOptions extends DecoratorCommonOptions {
    unique?: boolean;
    filter?: boolean | IdWhereOperator[];
}
export declare function IdField(options?: IdFieldOptions): any;
export {};
