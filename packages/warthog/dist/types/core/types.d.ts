export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export interface StringMap {
    [key: string]: string;
}
export interface StringMapOptional {
    [key: string]: string | undefined;
}
export declare type DateOnlyString = string;
export declare type DateTimeString = string;
export declare type IDType = string;
export interface BaseEntity {
    id: IDType;
    [key: string]: any;
}
export interface WhereInput {
    id_eq?: IDType;
    id_in?: IDType[];
}
export interface DeleteReponse {
    id: IDType;
}
export declare type ClassType<T = any> = new (...args: any[]) => T;
export declare type Constructor<T = any> = Function & {
    prototype: T;
};
export declare type Maybe<T> = T | void;
export declare type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export declare type JsonPrimitive = string | number | boolean | null;
export declare type JsonObject = {
    [member: string]: JsonValue;
};
export interface JsonArray extends Array<JsonValue> {
}
