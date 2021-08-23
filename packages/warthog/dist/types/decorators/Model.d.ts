import { ObjectOptions } from 'type-graphql/dist/decorators/ObjectType.d';
import { EntityOptions } from 'typeorm';
import { ClassType } from '../core';
interface ModelOptions {
    api?: ObjectOptions | false;
    db?: EntityOptions | false;
    apiOnly?: boolean;
    dbOnly?: boolean;
}
export declare function Model({ api, db, apiOnly, dbOnly }?: ModelOptions): (target: ClassType<any>) => any;
export {};
