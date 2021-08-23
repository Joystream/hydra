import { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import { DecoratorCommonOptions } from '../metadata';
import { ByteaColumnType, StringWhereOperator } from '../torm';
interface BytesFieldOptions extends ColumnCommonOptions, ColumnNumericOptions, DecoratorCommonOptions {
    dataType?: ByteaColumnType;
    filter?: boolean | StringWhereOperator[];
}
export declare function BytesField(options?: BytesFieldOptions): any;
export {};
