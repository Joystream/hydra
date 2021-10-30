import {
  Arg,
  Args,
  FieldResolver,
  Query,
  Resolver,
  Root,
  Field,
  Int,
  ObjectType,
  ArgsType,
  ID,
} from 'type-graphql'
import { Inject } from 'typedi'
import { Min } from 'class-validator'
import { PageInfo, Fields, RawFields, NestedFields } from '@joystream/warthog'

import {
  SubstrateEventWhereArgs,
  SubstrateEventWhereInput,
  SubstrateEventWhereUniqueInput,
  SubstrateEventOrderByEnum,
  SubstrateExtrinsicOrderByEnum,
} from '../../../generated'

import { SubstrateEvent } from './substrate-event.model'
import { SubstrateExtrinsic } from './../substrate-extrinsic/substrate-extrinsic.model'
import { SubstrateEventService } from './substrate-event.service'
import Debug from 'debug'

const debug = Debug('index-server:event-resolver')

@ObjectType()
export class IndexerHead {
  @Field(() => Number, { nullable: false })
  height!: number

  @Field(() => [String], { nullable: true })
  events?: string[]
}

@ObjectType()
export class SubstrateEventEdge {
  @Field(() => SubstrateEvent, { nullable: false })
  node!: SubstrateEvent

  @Field(() => String, { nullable: false })
  cursor!: string
}

@ArgsType()
export class SubstrateEventPageInput {
  @Field(() => ID, { nullable: true })
  afterID?: string

  @Field(() => Int, { nullable: true })
  @Min(0)
  limit?: number

  @Field(() => SubstrateEventWhereInput, { nullable: true })
  where?: SubstrateEventWhereInput
}

@ObjectType()
export class SubstrateEventConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number

  @Field(() => [SubstrateEventEdge], { nullable: false })
  edges!: SubstrateEventEdge[]

  @Field(() => PageInfo, { nullable: false })
  pageInfo!: PageInfo
}

@ArgsType()
export class ConnectionPageInputOptions {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first?: number

  @Field(() => String, { nullable: true })
  after?: string // V3: TODO: should we make a RelayCursor scalar?

  @Field(() => Int, { nullable: true })
  @Min(0)
  last?: number

  @Field(() => String, { nullable: true })
  before?: string
}

@ArgsType()
export class EventConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => SubstrateEventWhereInput, { nullable: true })
  where?: SubstrateEventWhereInput

  @Field(() => [SubstrateEventOrderByEnum], { nullable: true })
  orderBy?: SubstrateExtrinsicOrderByEnum[]
}

@Resolver(SubstrateEvent)
export class SubstrateEventResolver {
  constructor(
    @Inject('SubstrateEventService')
    public readonly service: SubstrateEventService
  ) {}

  @Query(() => SubstrateEventConnection)
  async eventsConnection(
    @Args() { where, orderBy, ...pageOptions }: EventConnectionWhereArgs,
    @RawFields() fields: Record<string, any>
  ): Promise<SubstrateEventConnection> {
    debug(`Page options: ${JSON.stringify(pageOptions, null, 2)}`)
    debug(`Fields: ${JSON.stringify(fields, null, 2)}`)
    if (fields.edges && fields.edges?.node && fields.edges?.node?.params) {
      fields.edges.node.params = {} // treat params as a scalar
    }
    return this.service.findConnection<SubstrateEventWhereInput>(
      where,
      orderBy,
      pageOptions,
      fields
    ) as Promise<SubstrateEventConnection>
  }

  // TODO: So really we just need a where input for ID
  @Query(() => [SubstrateEvent])
  async substrateEventsAfter(
    @Args() { afterID, where, limit }: SubstrateEventPageInput,
    @Fields() fields: string[],
    @NestedFields() nested: Record<string, unknown>
  ): Promise<SubstrateEvent[]> {
    debug(`Raw fields: ${JSON.stringify(fields, null, 2)}`)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _fields = Object.assign([], fields)
    // add params even if not requested;
    if (nested.params) {
      _fields.push('params')
    }

    return this.service.findAfter(where, afterID, limit, _fields)
  }

  @Query(() => [SubstrateEvent])
  async substrateEvents(
    @Args() { where, orderBy, limit, offset }: SubstrateEventWhereArgs,
    @Fields() fields: string[],
    @NestedFields() nested: Record<string, unknown>
  ): Promise<SubstrateEvent[]> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _fields = Object.assign([], fields)
    // add params even if not requested;
    if (nested.params) {
      _fields.push('params')
    }
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
