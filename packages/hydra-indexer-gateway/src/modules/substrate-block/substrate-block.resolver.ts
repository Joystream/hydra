import { Args, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'
import { PaginationArgs } from 'warthog'
import { SubstrateBlockService } from './substrate-block.service'
import { SubstrateBlock } from './substrate-block.model'
import { ArgsType, Field as TypeGraphQLField, InputType } from 'type-graphql'

import {
  SubstrateBlockWhereInput,
  SubstrateBlockOrderByEnum,
  EventInfoWhereInput,
  ExtrinsicInfoWhereInput,
} from '../../../generated'
import { TopLevelFields } from '../../decorators/fields'

@InputType()
export class SubstrateBlockWhereInputAugmented extends SubstrateBlockWhereInput {
  @TypeGraphQLField(() => ExtrinsicInfoWhereInput, { nullable: true })
  extrinsics_some?: ExtrinsicInfoWhereInput

  @TypeGraphQLField(() => EventInfoWhereInput, { nullable: true })
  events_some?: EventInfoWhereInput
}

@ArgsType()
export class SubstrateBlockWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => SubstrateBlockWhereInputAugmented, { nullable: true })
  where?: SubstrateBlockWhereInputAugmented

  @TypeGraphQLField(() => SubstrateBlockOrderByEnum, { nullable: true })
  orderBy?: SubstrateBlockOrderByEnum
}

@Resolver(SubstrateBlock)
export class SubstrateBlockResolver {
  constructor(
    @Inject('SubstrateBlockService')
    public readonly service: SubstrateBlockService
  ) {}

  @Query(() => [SubstrateBlock])
  async substrateBlocks(
    @Args() { where, orderBy, limit }: SubstrateBlockWhereArgs,
    @TopLevelFields() fields: string[]
  ): Promise<SubstrateBlock[]> {
    return this.service.findWithNames(where, orderBy, limit, fields)
  }
}
