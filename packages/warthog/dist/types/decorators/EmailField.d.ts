import { DecoratorCommonOptions } from '../metadata';
import { EmailWhereOperator } from '../torm';
interface EmailFieldOptions extends DecoratorCommonOptions {
    unique?: boolean;
    filter?: boolean | EmailWhereOperator[];
}
export declare function EmailField(options?: EmailFieldOptions): any;
export {};
