import { AnyJson, EventInfo, ExtrinsicInfo } from '@dzlzv/hydra-common'
import { Column } from 'typeorm'
import { Field } from 'type-graphql'
import {
  BaseModel,
  IntField,
  WarthogField,
  Model,
  StringField,
  JSONField,
} from 'warthog'
import GraphQLBigNumber from '../../types/bn-graphql'

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

  @JSONField()
  events!: EventInfo[]

  @JSONField()
  extrinsics!: ExtrinsicInfo[]
}
