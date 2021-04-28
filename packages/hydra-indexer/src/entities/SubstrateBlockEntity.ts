import { AnyJson } from '@dzlzv/hydra-common'
import BN from 'bn.js'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { AbstractWarthogModel } from './AbstractWarthogModel'

@Entity({
  name: 'substrate_block',
})
export class SubstrateBlockEntity extends AbstractWarthogModel {
  @Column()
  @Index()
  height!: number

  @Column()
  timestamp!: BN

  @Column()
  @PrimaryColumn()
  hash!: string

  @Column()
  @Index()
  parentHash!: string

  @Column()
  stateRoot!: string

  @Column()
  extrinsicRoot!: string

  @Column({ type: 'jsonb' })
  @Index()
  runtimeVersion!: AnyJson

  @Column({ type: 'jsonb' })
  @Index()
  lastRuntimeUpgrade!: AnyJson

  @Column({ type: 'jsonb' })
  events!: AnyJson[]

  @Column({ type: 'jsonb' })
  extrinsics!: AnyJson[]
}
