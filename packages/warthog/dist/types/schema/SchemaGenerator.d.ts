import * as prettier from 'prettier';
import { Logger } from '../core/logger';
export declare class SchemaGenerator {
    static logger: Logger;
    static generate(warthogImportPath?: string): string;
    static format(code: string, options?: prettier.Options): string;
}
