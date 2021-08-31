import { Field } from 'type-graphql';
import { JoinTable, ManyToMany as TypeORMManyToMany } from 'typeorm';

import { getMetadataStorage } from '../metadata';
import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

// Note: for many to many relationships, you need to set one item as the "JoinTable"
// therefore, we have 2 separate decorators.  Just make sure to add one to one table and
// One to the other in the relationship
export function ManyToManyJoin(parentType: any, joinFunc: any, options: any = {}): any {
  const factories = [
    JoinTable() as MethodDecoratorFactory,
    Field(() => [parentType()], { ...options }) as MethodDecoratorFactory,
    TypeORMManyToMany(parentType, joinFunc, options) as MethodDecoratorFactory,
  ];

  getMetadataStorage().addModelRelation({ ...options, isList: true });

  return composeMethodDecorators(...factories);
}
