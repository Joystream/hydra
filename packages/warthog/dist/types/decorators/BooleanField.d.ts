import { DecoratorCommonOptions } from '../metadata';
import { BooleanWhereOperator } from '../torm';
interface BooleanFieldOptions extends DecoratorCommonOptions {
    default?: boolean;
    filter?: boolean | BooleanWhereOperator[];
}
export declare function BooleanField(options?: BooleanFieldOptions): any;
export {};
