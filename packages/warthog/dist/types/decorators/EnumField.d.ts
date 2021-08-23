import { DecoratorCommonOptions } from '../metadata';
import { EnumWhereOperator } from '../torm';
interface EnumFieldOptions extends DecoratorCommonOptions {
    default?: any;
    filter?: boolean | EnumWhereOperator[];
}
export declare function EnumField(name: string, enumeration: object, options?: EnumFieldOptions): any;
export {};
