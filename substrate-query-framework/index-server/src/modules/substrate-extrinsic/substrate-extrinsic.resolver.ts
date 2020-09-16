import { Arg, Args, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'
import { Fields } from 'warthog'

import {
  SubstrateExtrinsicWhereArgs,
  SubstrateExtrinsicWhereInput,
  SubstrateExtrinsicWhereUniqueInput,
} from '../../../generated'

import { SubstrateExtrinsic } from './substrate-extrinsic.model'
import { SubstrateExtrinsicService } from './substrate-extrinsic.service'

@Resolver(SubstrateExtrinsic)
export class SubstrateExtrinsicResolver {
  constructor(
    @Inject('SubstrateExtrinsicService')
    public readonly service: SubstrateExtrinsicService
  ) {}

  @Query(() => [SubstrateExtrinsic])
  async substrateExtrinsics(
    @Args() { where, orderBy, limit, offset }: SubstrateExtrinsicWhereArgs,
    @Fields() fields: string[]
  ): Promise<SubstrateExtrinsic[]> {
    return this.service.find<SubstrateExtrinsicWhereInput>(
      where,
      orderBy,
      limit,
      offset,
      fields
    )
  }

  @Query(() => SubstrateExtrinsic)
  async substrateExtrinsic(
    @Arg('where') where: SubstrateExtrinsicWhereUniqueInput
  ): Promise<SubstrateExtrinsic> {
    return this.service.findOne<SubstrateExtrinsicWhereUniqueInput>(where)
  }
}
