import { DecoratorCommonOptions } from '../metadata';
import { StringColumnType, StringWhereOperator } from '../torm';
interface StringFieldOptions extends DecoratorCommonOptions {
    dataType?: StringColumnType;
    maxLength?: number;
    minLength?: number;
    default?: string;
    unique?: boolean;
    filter?: boolean | StringWhereOperator[];
    array?: boolean;
}
export declare function StringField(options?: StringFieldOptions): any;
export {};
