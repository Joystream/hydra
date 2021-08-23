export declare class ObjectUtil {
    static prefixKeys<T>(obj: {
        [key: string]: T;
    }, prefix: string): {
        [key: string]: T;
    };
    static constantizeKeys<T>(obj: {
        [key: string]: T;
    }): {
        [key: string]: T;
    };
}
