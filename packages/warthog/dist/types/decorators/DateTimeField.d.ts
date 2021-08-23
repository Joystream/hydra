import { DecoratorCommonOptions } from '../metadata';
import { DateTimeString } from '../core';
import { DateTimeWhereOperator } from '../torm';
interface DateTimeFieldOptions extends DecoratorCommonOptions {
    default?: DateTimeString;
    filter?: boolean | DateTimeWhereOperator[];
}
export declare function DateTimeField(options?: DateTimeFieldOptions): any;
export {};
