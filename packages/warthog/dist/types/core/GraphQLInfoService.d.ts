export declare type ConnectionInputFields = {
    totalCount?: object;
    edges?: {
        node?: object;
        cursor?: object;
    };
    pageInfo?: {
        hasNextPage: object;
        hasPreviousPage: object;
        startCursor?: object;
        endCursor?: object;
    };
};
export interface Node {
    [key: string]: any;
}
export declare class GraphQLInfoService {
    getFields(info: any): ConnectionInputFields;
    connectionOptions(fields?: ConnectionInputFields): {
        selectFields: never[];
        totalCount: boolean;
        endCursor: boolean;
        startCursor: string;
        edgeCursors: string;
    } | {
        selectFields: string[];
        totalCount: boolean;
        endCursor: boolean;
        startCursor: boolean;
        edgeCursors: boolean;
    };
    baseFields(node?: Node): string[];
}
