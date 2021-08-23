import * as Debug from 'debug';
export declare const logger: {
    debug: Debug.Debugger;
    error: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    info: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    log: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    warn: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    logObject: (...args: any[]) => void;
};
declare type logFunc = (...args: any[]) => void;
export interface Logger {
    debug?: logFunc;
    error: logFunc;
    info: logFunc;
    log: logFunc;
    warn: logFunc;
}
export {};
