import { DeepPartial, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { StandardDeleteResponse } from '../tgql';
import { BaseModel } from './';
import { StringMap, WhereInput } from './types';
import { ConnectionInputFields, GraphQLInfoService } from './GraphQLInfoService';
import { ConnectionResult, RelayPageOptions, RelayService } from './RelayService';
export interface BaseOptions {
    manager?: EntityManager;
}
interface WhereFilterAttributes {
    [key: string]: string | number | null;
}
declare type WhereExpression = {
    AND?: WhereExpression[];
    OR?: WhereExpression[];
} & WhereFilterAttributes;
export declare type LimitOffset = {
    limit: number;
    offset?: number;
};
export declare type PaginationOptions = LimitOffset | RelayPageOptions;
export declare type RelayPageOptionsInput = {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
};
export declare class BaseService<E extends BaseModel> {
    protected entityClass: any;
    protected repository: Repository<E>;
    manager: EntityManager;
    columnMap: StringMap;
    klass: string;
    relayService: RelayService;
    graphQLInfoService: GraphQLInfoService;
    constructor(entityClass: any, repository: Repository<E>);
    getQueryBuilder<W extends WhereInput>(where?: any, // V3: WhereExpression = {},
    orderBy?: string | string[], limit?: number, offset?: number, fields?: string[], options?: BaseOptions): SelectQueryBuilder<E>;
    find<W extends WhereInput>(where?: any, // V3: WhereExpression = {},
    orderBy?: string | string[], limit?: number, offset?: number, fields?: string[], options?: BaseOptions): Promise<E[]>;
    findConnection<W extends WhereInput>(whereUserInput?: any, // V3: WhereExpression = {},
    orderBy?: string | string[], _pageOptions?: RelayPageOptionsInput, fields?: ConnectionInputFields, options?: BaseOptions): Promise<ConnectionResult<E>>;
    buildFindQuery<W extends WhereInput>(where?: WhereExpression, orderBy?: string | string[], pageOptions?: LimitOffset, fields?: string[], options?: BaseOptions): SelectQueryBuilder<E>;
    findOne<W>(where: W, // V3: WhereExpression
    options?: BaseOptions): Promise<E>;
    create(data: DeepPartial<E>, userId: string, options?: BaseOptions): Promise<E>;
    createMany(data: DeepPartial<E>[], userId: string, options?: BaseOptions): Promise<E[]>;
    update<W extends any>(data: DeepPartial<E>, where: W, // V3: WhereExpression,
    userId: string, options?: BaseOptions): Promise<E>;
    delete<W extends object>(where: W, userId: string, options?: BaseOptions): Promise<StandardDeleteResponse>;
    attrsToDBColumns: (attrs: string[]) => string[];
    attrToDBColumn: (attr: string) => string;
}
export {};
