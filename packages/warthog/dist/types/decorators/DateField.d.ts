import { DecoratorCommonOptions } from '../metadata';
import { ColumnType, DateWhereOperator } from '../torm';
interface DateFieldOptions extends DecoratorCommonOptions {
    dataType?: ColumnType;
    default?: Date;
    filter?: boolean | DateWhereOperator[];
}
export declare function DateField(options?: DateFieldOptions): any;
export {};
