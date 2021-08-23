import { Container } from 'typedi';
import { Logger } from '../core';
interface ConfigOptions {
    dotenvPath?: string;
    configSearchPath?: string;
    container?: Container;
    logger?: Logger;
}
export declare class Config {
    private options;
    readonly WARTHOG_ENV_PREFIX = "WARTHOG_";
    readonly TYPEORM_ENV_PREFIX = "TYPEORM_";
    readonly WARTHOG_DB_ENV_PREFIX = "WARTHOG_DB_";
    defaults: Record<string, any>;
    devDefaults: Record<string, any>;
    testDefaults: Record<string, any>;
    PROJECT_ROOT: string;
    container: Container;
    logger?: Logger;
    NODE_ENV?: string;
    config: any;
    constructor(options?: ConfigOptions);
    determineNodeEnv(dotenvPath: string): string | undefined;
    loadDotenvFiles(dotenvPath: string): void;
    loadSync(): Config;
    get(key?: string): any;
    warthogEnvVariables(): any;
    warthogDBEnvVariables(): any;
    typeORMEnvVariables(): any;
    translateEnvVar(key: string, value: string): string | string[];
    envVarsByPrefix(prefix: string): any;
    typeORMToWarthogEnvVariables(): any;
    writeWarthogEnvVars(): void;
    validateEntryExists(key: string): void;
    loadStaticConfigSync(): {
        [key: string]: any;
    };
    private loadStaticConfigFileSync;
}
export {};
