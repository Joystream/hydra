import {
  AnyJson,
  EventInfo,
  ExtrinsicInfo,
  formatId,
  SubstrateBlock,
} from '@dzlzv/hydra-common'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { BlockData, fullName, getExtrinsic } from '../model'
import { AbstractWarthogModel } from './AbstractWarthogModel'

/**
 * TypeORM Entity class representing block data
 */
@Entity({
  name: 'substrate_block',
})
export class SubstrateBlockEntity
  extends AbstractWarthogModel
  implements SubstrateBlock {
  @PrimaryColumn()
  id!: string

  @Column()
  @Index()
  height!: number

  @Column('bigint')
  timestamp!: number

  @Column()
  @Index()
  hash!: string

  @Column()
  @Index()
  parentHash!: string

  @Column()
  stateRoot!: string

  @Column()
  extrinsicsRoot!: string

  @Column({ type: 'jsonb' })
  runtimeVersion!: AnyJson

  @Column({ type: 'jsonb' })
  lastRuntimeUpgrade!: AnyJson

  @Column({ type: 'jsonb' })
  events!: EventInfo[]

  @Column({ type: 'jsonb' })
  extrinsics!: ExtrinsicInfo[]

  static fromBlockData({
    lastRuntimeUpgrade,
    runtimeVersion,
    events,
    signedBlock: { block },
    timestamp,
  }: BlockData): SubstrateBlockEntity {
    const entity = new SubstrateBlockEntity()

    entity.lastRuntimeUpgrade = lastRuntimeUpgrade
      ? (lastRuntimeUpgrade.toJSON() as AnyJson)
      : {}
    entity.runtimeVersion = runtimeVersion
      ? (runtimeVersion.toJSON() as AnyJson)
      : {}
    const { header } = block

    entity.hash = header.hash.toHex()
    entity.parentHash = header.parentHash.toHex()
    entity.stateRoot = header.stateRoot.toHex()
    entity.height = header.number.toNumber()
    entity.extrinsicsRoot = header.extrinsicsRoot.toHex()
    entity.timestamp = timestamp
    entity.id = formatId({ height: entity.height, hash: entity.hash })

    entity.extrinsics = block.extrinsics.map((extrinsic, index) => {
      return {
        id: formatId({ height: entity.height, index, hash: entity.hash }),
        name: fullName(extrinsic.method),
      }
    })

    entity.events = events.map((eventRecord, index) => {
      const extrinsic = getExtrinsic({
        record: eventRecord,
        extrinsics: block.extrinsics,
      })
      return {
        id: formatId({ height: entity.height, index, hash: entity.hash }),
        name: fullName(eventRecord.event),
        extrinsic: extrinsic ? fullName(extrinsic.method) : 'none',
      }
    })

    return entity
  }
}
