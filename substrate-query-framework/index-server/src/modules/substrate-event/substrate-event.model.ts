// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  BaseModel,
  Model,
  StringField,
  JSONField,
  IntField,
  WarthogField,
} from 'warthog'
import { SubstrateExtrinsic } from '../substrate-extrinsic/substrate-extrinsic.model'
import { Column, OneToOne, JoinColumn } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'
import { AnyJson, AnyJsonField } from '@dzlzv/hydra-common'
import { GraphQLJSON } from 'graphql-type-json'

@ObjectType()
export class EventParam {
  @Field()
  type!: string

  @Field()
  name?: string

  @Field(() => GraphQLJSON, { nullable: true })
  value?: AnyJsonField
}

@Model({ db: { name: 'substrate_event' } })
export class SubstrateEvent extends BaseModel {
  @StringField()
  name!: string

  @StringField({
    nullable: true,
  })
  section?: string

  @StringField()
  method!: string

  @JSONField()
  phase!: AnyJson

  @IntField()
  blockNumber!: number

  @IntField()
  index!: number

  @Field(() => [EventParam], { nullable: true })
  @Column('jsonb')
  @WarthogField('json', { nullable: true })
  params?: EventParam[]

  @OneToOne(() => SubstrateExtrinsic, (e: SubstrateExtrinsic) => e.event, {
    cascade: true,
    nullable: true,
  })
  @Field(() => SubstrateExtrinsic, { nullable: true })
  @JoinColumn()
  extrinsic?: SubstrateExtrinsic
}
