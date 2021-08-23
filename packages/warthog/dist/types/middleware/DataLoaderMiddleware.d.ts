import { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';
import { BaseContext } from '../core';
export declare class DataLoaderMiddleware implements MiddlewareInterface<BaseContext> {
    use({ context }: ResolverData<BaseContext>, next: NextFn): Promise<any>;
}
