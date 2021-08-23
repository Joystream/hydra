import { HttpLink } from 'apollo-link-http';
import { Binding } from 'graphql-binding';
import { StringMapOptional } from '../core';
interface LinkOptions extends StringMapOptional {
    token?: string;
    origin: string;
}
export declare class Link extends HttpLink {
    constructor(uri: string, options: LinkOptions);
}
export declare class RemoteBinding extends Binding {
    constructor(httpLink: HttpLink, typeDefs: string);
}
export declare function getRemoteBinding(endpoint: string, options: LinkOptions): Promise<RemoteBinding>;
export declare function generateBindingFile(inputSchemaPath: string, outputBindingFile: string): Promise<void>;
export declare function getOriginalError(error: any): any;
export declare function getBindingError(err: any): any;
export { Binding };
