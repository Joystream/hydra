import { Args, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'
import { Fields } from 'warthog'
import { SubstrateBlockService } from './substrate-block.service'
import { SubstrateBlock } from './substrate-block.model'

import {
  SubstrateBlockWhereArgs,
  SubstrateBlockWhereInput,
} from '../../../generated'

@Resolver(SubstrateBlock)
export class SubstrateBlockResolver {
  constructor(
    @Inject('SubstrateBlockService')
    public readonly service: SubstrateBlockService
  ) {}

  @Query(() => [SubstrateBlock])
  async substrateBlocks(
    @Args() { where, orderBy, limit, offset }: SubstrateBlockWhereArgs,
    @Fields() fields: string[]
  ): Promise<SubstrateBlock[]> {
    return this.service.find<SubstrateBlockWhereInput>(
      where,
      orderBy,
      limit,
      offset,
      fields
    )
  }
}
