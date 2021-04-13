import {
  AnyJson,
  SubstrateBlock,
  EventInfo,
  ExtrinsicInfo,
  formatEventId,
} from '@dzlzv/hydra-common'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { SubstrateEventEntity } from '.'
import { BlockData, getExtrinsic } from '../model'
import { fromBlockExtrinsic } from './SubstrateExtrinsicEntity'

@Entity({
  name: 'substrate_block',
})
export class SubstrateBlockEntity implements SubstrateBlock {
  @Column()
  @Index()
  height!: number

  @Column('bigint')
  timestamp!: number

  @Column()
  @PrimaryColumn()
  hash!: string

  @Column()
  @Index()
  parentHash!: string

  @Column()
  stateRoot!: string

  @Column()
  extrinsicsRoot!: string

  @Column({ type: 'jsonb' })
  @Index()
  runtimeVersion!: AnyJson

  @Column({ type: 'jsonb' })
  @Index()
  lastRuntimeUpgrade!: AnyJson

  @Column({ type: 'jsonb' })
  @Index()
  events!: EventInfo[]

  @Column({ type: 'jsonb' })
  @Index()
  extrinsics!: ExtrinsicInfo[]

  static fromBlockData({
    lastRuntimeUpgrade,
    runtimeVersion,
    events,
    signedBlock: { block },
    timestamp,
  }: BlockData): SubstrateBlockEntity & SubstrateBlock {
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

    entity.extrinsics = block.extrinsics.map((extrinsic, index) => {
      const extrinsicEntity = fromBlockExtrinsic({
        e: extrinsic,
        blockNumber: entity.height,
      })
      return {
        id: formatEventId(entity.height, index), // TODO: rename
        name: extrinsicEntity.name,
      }
    })

    entity.events = events.map((eventRecord, index) => {
      const eventEntity = SubstrateEventEntity.fromQueryEvent({
        blockNumber: entity.height,
        blockTimestamp: timestamp,
        indexInBlock: index,
        eventRecord,
      })

      return {
        id: eventEntity.id,
        name: eventEntity.name,
        extrinsic:
          getExtrinsic({
            record: eventRecord,
            extrinsics: block.extrinsics,
          }) || 'none',
      } as EventInfo
    })

    return entity
  }
}
