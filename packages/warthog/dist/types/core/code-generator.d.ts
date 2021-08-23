import { GraphQLSchema } from 'graphql';
import * as mkdirp from 'mkdirp';
interface CodeGeneratorOptions {
    resolversPath: string[];
    validateResolvers?: boolean;
    warthogImportPath?: string;
}
export declare class CodeGenerator {
    private generatedFolder;
    private modelsArray;
    private options;
    schema?: GraphQLSchema;
    constructor(generatedFolder: string, modelsArray: string[], options: CodeGeneratorOptions);
    createGeneratedFolder(): mkdirp.Made;
    generate(): Promise<void>;
    private generateBinding;
    private buildGraphQLSchema;
    private writeGeneratedTSTypes;
    private getGeneratedTypes;
    private writeSchemaFile;
    private writeGeneratedIndexFile;
    private writeOrmConfig;
    private writeToGeneratedFolder;
}
export {};
