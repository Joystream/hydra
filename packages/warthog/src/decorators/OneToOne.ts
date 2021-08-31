import { Field } from 'type-graphql';
import { OneToOne as TypeORMOneToOne } from 'typeorm';

import { getMetadataStorage } from '../metadata';
import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

export function OneToOne(parentType: any, joinFunc: any, options: any = {}): any {
  const factories = [
    Field(parentType, { ...options }) as MethodDecoratorFactory,
    TypeORMOneToOne(parentType, joinFunc, options) as MethodDecoratorFactory,
  ];
  getMetadataStorage().addModelRelation({ ...options, isList: false });

  return composeMethodDecorators(...factories);
}
