import { Resolver, Query } from 'type-graphql'
import { getRepository } from 'typeorm'
import { DeepModel } from './one/two/three/deep.model'
import { ShallowModel } from './shallow.model'

@Resolver()
export class ModelResolver {
  @Query(() => [ShallowModel])
  shallowModel(): Promise<ShallowModel[]> {
    const repo = getRepository(ShallowModel)
    return repo.find()
  }

  @Query(() => [DeepModel])
  deepModel(): Promise<DeepModel[]> {
    const repo = getRepository(DeepModel)
    return repo.find()
  }
}
