import { AdvancedOptions } from 'type-graphql/dist/decorators/types';
import { ColumnType } from 'typeorm';
import { ColumnOptions } from 'typeorm/decorator/options/ColumnOptions';
import { FieldType, DecoratorCommonOptions } from '../metadata';
interface CustomColumnOptions extends ColumnOptions {
    type: ColumnType;
}
interface ExtendedTypeGraphQLOptions extends AdvancedOptions, DecoratorCommonOptions {
    type: FieldType;
    nullable?: boolean;
}
interface CustomFieldOptions {
    api: ExtendedTypeGraphQLOptions;
    db: CustomColumnOptions;
    isArray?: boolean;
}
export declare function CustomField(args: CustomFieldOptions): any;
export {};
