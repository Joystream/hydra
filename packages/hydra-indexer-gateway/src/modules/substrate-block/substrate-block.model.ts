import { AnyJson } from '@joystream/hydra-common'
import { Column } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import {
  BaseModel,
  IntField,
  WarthogField,
  Model,
  StringField,
  JSONField,
} from '@joystream/warthog'
import GraphQLBigNumber from '../../types/bn-graphql'

@ObjectType()
export class EventInfo {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  extrinsic?: string
}

@ObjectType()
export class ExtrinsicInfo {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string
}

@Model({ db: { name: 'substrate_block' } })
export class SubstrateBlock extends BaseModel {
  @IntField()
  height!: number

  @Field(() => GraphQLBigNumber)
  @WarthogField('integer')
  @Column('bigint')
  timestamp!: number

  @StringField()
  hash!: string

  @StringField()
  parentHash!: string

  @StringField()
  stateRoot!: string

  @StringField()
  extrinsicsRoot!: string

  @JSONField()
  runtimeVersion!: AnyJson

  @JSONField()
  lastRuntimeUpgrade!: AnyJson

  @Field(() => [EventInfo])
  @Column('jsonb')
  @WarthogField('json')
  events!: EventInfo[]

  @Field(() => [ExtrinsicInfo])
  @Column('jsonb')
  @WarthogField('json')
  extrinsics!: ExtrinsicInfo[]
}
