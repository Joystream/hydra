import { Arg, Args, FieldResolver, Query, Resolver, Root } from 'type-graphql'
import { Inject } from 'typedi'
import { Fields } from 'warthog'

import {
  SubstrateEventWhereArgs,
  SubstrateEventWhereInput,
  SubstrateEventWhereUniqueInput,
} from '../../../generated'

import { SubstrateEvent } from './substrate-event.model'
import { SubstrateExtrinsic } from './../substrate-extrinsic/substrate-extrinsic.model'

import { SubstrateEventService } from './substrate-event.service'

@Resolver(SubstrateEvent)
export class SubstrateEventResolver {
  constructor(
    @Inject('SubstrateEventService')
    public readonly service: SubstrateEventService
  ) {}

  @Query(() => [SubstrateEvent])
  async substrateEvents(
    @Args() { where, orderBy, limit, offset }: SubstrateEventWhereArgs,
    @Fields() fields: string[]
  ): Promise<SubstrateEvent[]> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _fields = Object.assign([], fields)
    // add params even if not requested;
    _fields.push('params')
    return this.service.find<SubstrateEventWhereInput>(
      where,
      orderBy, // by default order by ID
      limit,
      offset,
      _fields
    )
  }

  @Query(() => SubstrateEvent)
  async substrateEvent(
    @Arg('where') where: SubstrateEventWhereUniqueInput
  ): Promise<SubstrateEvent> {
    return this.service.findOne<SubstrateEventWhereUniqueInput>(where)
  }

  @FieldResolver(() => SubstrateExtrinsic)
  async extrinsic(
    @Root() event: SubstrateEvent
  ): Promise<SubstrateExtrinsic | undefined> {
    return this.service.getExtrinsic(event.id)
  }
}
