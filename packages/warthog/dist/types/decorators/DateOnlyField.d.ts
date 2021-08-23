import { DecoratorCommonOptions } from '../metadata';
import { DateOnlyString } from '../core';
import { DateOnlyWhereOperator } from '../torm';
interface DateOnlyFieldOptions extends DecoratorCommonOptions {
    default?: DateOnlyString;
    filter?: boolean | DateOnlyWhereOperator[];
}
export declare function DateOnlyField(options?: DateOnlyFieldOptions): any;
export {};
