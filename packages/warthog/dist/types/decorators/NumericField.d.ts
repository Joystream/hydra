import { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import { DecoratorCommonOptions } from '../metadata';
import { NumericColumnType, NumericWhereOperator } from '../torm';
interface NumericFieldOptions extends ColumnCommonOptions, ColumnNumericOptions, DecoratorCommonOptions {
    dataType?: NumericColumnType;
    filter?: boolean | NumericWhereOperator[];
}
export declare function NumericField(options?: NumericFieldOptions): any;
export {};
