import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  Index,
} from 'typeorm'
import {
  AnyJson,
  AnyJsonField,
  ExtrinsicArg,
  SubstrateExtrinsic,
} from '@dzlzv/hydra-common'
import BN from 'bn.js'
import { NumericTransformer } from '@dzlzv/bn-typeorm'
import { SubstrateEventEntity } from './SubstrateEventEntity'
import { AbstractWarthogModel } from './AbstractWarthogModel'
import { Extrinsic } from '@polkadot/types/interfaces'

export const EXTRINSIC_TABLE_NAME = 'substrate_extrinsic'

@Entity({
  name: EXTRINSIC_TABLE_NAME,
})
export class SubstrateExtrinsicEntity extends AbstractWarthogModel
  implements SubstrateExtrinsic {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'numeric',
    transformer: new NumericTransformer(),
  })
  tip!: BN

  @Column({
    type: 'numeric',
  })
  @Index()
  blockNumber!: number

  @Column()
  versionInfo!: string

  @Column({
    type: 'jsonb',
  })
  meta!: AnyJson

  @Column()
  method!: string

  @Column()
  section!: string

  @Column({
    type: 'jsonb',
  })
  args!: ExtrinsicArg[]

  @Column()
  signer!: string

  @Column()
  signature!: string

  @Column()
  nonce!: number

  @Column({
    type: 'jsonb',
  })
  era!: AnyJson

  @Column()
  hash!: string

  @Column()
  isSigned!: boolean

  @OneToOne(
    () => SubstrateEventEntity,
    (event: SubstrateEventEntity) => event.extrinsic
  ) // specify inverse side as a second parameter
  event!: SubstrateEventEntity
}

export function fromBlockExtrinsic(data: {
  e: Extrinsic
  blockNumber: number
}): SubstrateExtrinsicEntity {
  const extr = new SubstrateExtrinsicEntity()
  const { e, blockNumber } = data

  extr.blockNumber = blockNumber
  extr.signature = e.signature.toString()
  extr.signer = e.signer.toString()

  extr.method = e.method.method || 'NO_METHOD'
  extr.section = e.method.section || 'NO_SECTION'

  extr.meta = (e.meta.toJSON() || {}) as AnyJson
  extr.hash = e.hash.toString()

  extr.isSigned = e.isSigned
  extr.tip = new BN(e.tip.toString())
  extr.versionInfo = e.version.toString()
  extr.nonce = e.nonce.toNumber()
  extr.era = (e.era.toJSON() || {}) as AnyJson

  extr.args = []

  e.method.args.forEach((data, index) => {
    const name = e.meta.args[index].name.toString()
    const value = (data.toJSON() || '') as AnyJsonField
    const type = data.toRawType()

    extr.args.push({
      type,
      value,
      name,
    })
  })

  return extr
}
