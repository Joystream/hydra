import { DecoratorCommonOptions } from '../metadata';
import { FloatColumnType, FloatWhereOperator } from '../torm';
interface FloatFieldOptions extends DecoratorCommonOptions {
    dataType?: FloatColumnType;
    default?: number;
    filter?: boolean | FloatWhereOperator[];
}
export declare function FloatField(options?: FloatFieldOptions): any;
export {};
