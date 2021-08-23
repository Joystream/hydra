import { BaseModel } from './BaseModel';
import { EncodingService } from './encoding';
export declare type Cursor = string;
export interface ConnectionEdge<E> {
    node?: E;
    cursor?: Cursor;
}
export interface ConnectionResult<E> {
    totalCount?: number;
    edges?: ConnectionEdge<E>[];
    pageInfo?: PageInfo;
}
declare type PageInfo = {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: Cursor;
    endCursor: Cursor;
};
export declare type RelayFirstAfter = {
    first: number;
    after?: string;
};
export declare type RelayLastBefore = {
    last: number;
    before?: string;
};
export declare type RelayPageOptions = RelayFirstAfter | RelayLastBefore;
export declare type SortColumn = string;
export declare type SortDirection = 'ASC' | 'DESC';
export declare type Sort = {
    column: SortColumn;
    direction: SortDirection;
};
declare type SortAndValue = [SortColumn, SortDirection, string | number];
declare type SortAndValueArray = Array<SortAndValue>;
declare type Sortable = string | string[] | Sort | Sort[] | undefined;
interface WhereExpression {
    [key: string]: string | number | null;
}
declare type WhereInput = {
    AND?: WhereInput[];
    OR?: WhereInput[];
} & WhereExpression;
export declare class RelayService {
    encoding: EncodingService;
    constructor();
    getPageInfo<E extends BaseModel>(items: E[], sortable: Sortable, pageOptions: RelayPageOptions): PageInfo;
    firstAndLast<E>(items: E[], limit: number): E[];
    encodeCursor<E extends BaseModel>(record: E, sortable: Sortable): Cursor;
    decodeCursor(cursor: Cursor): SortAndValueArray;
    toSortArray(sort?: Sortable): Sort[];
    normalizeSort(sortable?: Sortable): Sort[];
    flipDirection(direction: SortDirection): SortDirection;
    effectiveOrder(sortable: Sortable, pageOptions: RelayPageOptions): Sort[];
    effectiveOrderStrings(sortable: Sortable, pageOptions: RelayPageOptions): string[];
    toSortStrings(sorts: Sort[]): string[];
    getFilters(sortable: Sortable, pageOptions: RelayPageOptions): WhereInput;
}
export {};
