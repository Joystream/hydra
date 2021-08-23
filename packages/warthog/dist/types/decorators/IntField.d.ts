import { DecoratorCommonOptions } from '../metadata';
import { IntColumnType, IntWhereOperator } from '../torm';
interface IntFieldOptions extends DecoratorCommonOptions {
    dataType?: IntColumnType;
    default?: number;
    filter?: boolean | IntWhereOperator[];
    array?: boolean;
}
export declare function IntField(options?: IntFieldOptions): any;
export {};
