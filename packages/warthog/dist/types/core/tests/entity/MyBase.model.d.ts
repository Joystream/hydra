import { Repository } from 'typeorm';
import { BaseModel, BaseService } from '../../';
export declare class MyBase extends BaseModel {
    registered?: boolean;
    firstName: string;
    lastName: string;
}
export declare class MyBaseService extends BaseService<MyBase> {
    protected readonly repository: Repository<MyBase>;
    constructor(repository: Repository<MyBase>);
}
