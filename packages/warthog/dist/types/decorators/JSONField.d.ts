import { ClassType } from '../core/types';
interface JSONFieldOptions {
    nullable?: boolean;
    filter?: boolean;
    gqlFieldType?: ClassType;
}
export declare function JSONField(options?: JSONFieldOptions): any;
export {};
