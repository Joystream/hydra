import { ColumnType } from 'typeorm';
import { ColumnMetadata, FieldType } from '../metadata';
export interface WarthogCombinedDecoratorOptions<T> {
    fieldType: FieldType;
    warthogColumnMeta: T;
    gqlFieldType?: any;
    dbType?: ColumnType;
    dbColumnOptions?: any;
}
export declare function getCombinedDecorator<T extends Partial<ColumnMetadata>>({ fieldType, warthogColumnMeta, gqlFieldType, dbType, dbColumnOptions: columnOptions }: WarthogCombinedDecoratorOptions<T>): any[];
