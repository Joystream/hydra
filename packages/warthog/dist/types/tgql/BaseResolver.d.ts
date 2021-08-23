import { DeepPartial, Repository } from 'typeorm';
import { BaseModel, WhereInput } from '../core';
import { StandardDeleteResponse } from './DeleteResponse';
export declare class BaseResolver<E extends BaseModel> {
    protected entityClass: any;
    protected repository: Repository<E>;
    service: any;
    constructor(entityClass: any, repository: Repository<E>);
    find<W extends WhereInput>(where?: any, orderBy?: any, // Fix this
    limit?: number, offset?: number, fields?: string[]): Promise<E[]>;
    findOne<W extends any>(where: W): Promise<E>;
    create(data: DeepPartial<E>, userId: string): Promise<E>;
    createMany(data: DeepPartial<E>[], userId: string): Promise<E[]>;
    update<W extends any>(data: DeepPartial<E>, where: W, userId: string): Promise<E>;
    delete<W extends any>(where: W, userId: string): Promise<StandardDeleteResponse>;
}
