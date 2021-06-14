import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Index,
} from 'typeorm'
import {
  AnyJson,
  EventParam,
  SubstrateEvent,
  formatId,
  ExtrinsicArg,
} from '@dzlzv/hydra-common'
import { EventRecord } from '@polkadot/types/interfaces'
import { SubstrateExtrinsicEntity } from './SubstrateExtrinsicEntity'
import { AbstractWarthogModel } from './AbstractWarthogModel'
import { SubstrateBlockEntity } from './SubstrateBlockEntity'

export const EVENT_TABLE_NAME = 'substrate_event'

/**
 * TypeORM Entity class representing `SubstrateEvent` persistent data
 */
@Entity({
  name: EVENT_TABLE_NAME,
})
export class SubstrateEventEntity
  extends AbstractWarthogModel
  implements SubstrateEvent {
  @PrimaryColumn()
  id!: string

  @Column()
  @Index()
  name!: string

  @Column({
    nullable: true,
  })
  section?: string

  @Column({ nullable: true })
  @Index()
  extrinsicName?: string

  @Column({
    type: 'jsonb',
  })
  extrinsicArgs!: AnyJson

  @Column({ nullable: true })
  extrinsicHash?: string

  @Column({ nullable: true })
  extrinsicIndex?: number

  @Column()
  method!: string

  @Column({
    type: 'jsonb',
  })
  phase!: AnyJson

  @Column()
  @Index()
  blockNumber!: number

  @Column()
  @Index()
  blockHash!: string

  // PG int type size is not large enough
  @Column('bigint')
  blockTimestamp!: number

  @Column()
  indexInBlock!: number

  @Column({
    type: 'jsonb',
  })
  params!: EventParam[]

  @Column({
    type: 'jsonb',
  })
  data!: AnyJson

  @ManyToOne(
    () => SubstrateExtrinsicEntity,
    (e: SubstrateExtrinsicEntity) => e.events
  )
  @JoinColumn()
  extrinsic?: SubstrateExtrinsicEntity

  @ManyToOne(() => SubstrateBlockEntity)
  @JoinColumn({ name: 'block_id', referencedColumnName: 'id' })
  block!: SubstrateBlockEntity

  static fromQueryEvent(q: {
    blockNumber: number
    blockTimestamp: number
    indexInBlock: number
    eventRecord: EventRecord
    extrinsicEntity?: SubstrateExtrinsicEntity
    blockEntity: SubstrateBlockEntity
  }): SubstrateEventEntity {
    const _entity = new SubstrateEventEntity()

    const { hash } = q.blockEntity

    _entity.blockNumber = q.blockNumber
    _entity.blockHash = q.blockEntity.hash
    _entity.blockTimestamp = q.blockTimestamp
    _entity.indexInBlock = q.indexInBlock
    _entity.id = formatId({
      height: _entity.blockNumber,
      index: _entity.indexInBlock,
      hash,
    })
    _entity.block = q.blockEntity

    _entity.method = q.eventRecord.event.method || 'NO_METHOD'
    _entity.section = q.eventRecord.event.section || 'NO_SECTION'
    _entity.name = `${_entity.section}.${_entity.method}`
    _entity.phase = (q.eventRecord.phase.toJSON() || {}) as AnyJson

    _entity.params = []
    _entity.data = {} as AnyJson

    const { event } = q.eventRecord

    if (event.data.length) {
      q.eventRecord.event.data.forEach((data, index) => {
        const type = event.typeDef[index].type
        const name =
          event.typeDef[index].name ||
          event.typeDef[index].displayName ||
          `param${index}`
        const value = data ? data.toJSON() : {}

        _entity.data[name] = { type, value } as AnyJson
        _entity.params.push({
          type,
          name,
          value,
        } as EventParam)
      })
    }

    const extrinsicArgs: AnyJson = {}

    if (q.extrinsicEntity) {
      _entity.extrinsic = q.extrinsicEntity
      _entity.extrinsic.args.forEach(({ name, value, type }: ExtrinsicArg) => {
        extrinsicArgs[name] = { type, value }
      })
      _entity.extrinsicName = _entity.extrinsic.name
      _entity.extrinsicHash = _entity.extrinsic.hash
      _entity.extrinsicIndex = _entity.extrinsic.indexInBlock
    }

    _entity.extrinsicArgs = extrinsicArgs

    // debug(`Event entity: ${JSON.stringify(_entity, null, 2)}`);

    return _entity
  }
}
