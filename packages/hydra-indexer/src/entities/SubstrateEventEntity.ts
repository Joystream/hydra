import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Index,
} from 'typeorm'
import {
  AnyJson,
  AnyJsonField,
  EventParam,
  SubstrateEvent,
  formatEventId,
} from '@dzlzv/hydra-common'
import { EventRecord, Extrinsic } from '@polkadot/types/interfaces'
import BN from 'bn.js'
import {
  fromBlockExtrinsic,
  SubstrateExtrinsicEntity,
} from './SubstrateExtrinsicEntity'
import { AbstractWarthogModel } from './AbstractWarthogModel'
import { NumericTransformer } from '@dzlzv/bn-typeorm'

export const EVENT_TABLE_NAME = 'substrate_event'

@Entity({
  name: EVENT_TABLE_NAME,
})
@Index(['blockNumber', 'index'])
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
  extrinsicName?: string

  @Column({
    type: 'jsonb',
  })
  extrinsicArgs!: AnyJson

  @Column({ nullable: true })
  extrinsicHash?: string

  @Column()
  method!: string

  @Column({
    type: 'jsonb',
  })
  phase!: AnyJson

  @Column()
  @Index()
  blockNumber!: number

  // PG int type size is not large enough
  @Column('numeric', { transformer: new NumericTransformer() })
  blockTimestamp!: number

  @Column()
  index!: number

  @Column({
    type: 'jsonb',
  })
  params!: EventParam[]

  @Column({
    type: 'jsonb',
  })
  data!: AnyJson

  @OneToOne(
    () => SubstrateExtrinsicEntity,
    (e: SubstrateExtrinsicEntity) => e.event,
    {
      cascade: true,
      nullable: true,
    }
  )
  @JoinColumn()
  extrinsic?: SubstrateExtrinsicEntity

  static fromQueryEvent(q: {
    blockNumber: number
    blockTimestamp: number
    indexInBlock: number
    eventRecord: EventRecord
    extrinsic?: Extrinsic
  }): SubstrateEventEntity {
    const _entity = new SubstrateEventEntity()

    _entity.blockNumber = q.blockNumber
    _entity.blockTimestamp = q.blockTimestamp
    _entity.index = q.indexInBlock
    _entity.id = formatEventId(_entity.blockNumber, _entity.index)
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

    if (q.extrinsic) {
      const { extrinsic } = q
      _entity.extrinsic = fromBlockExtrinsic({
        e: extrinsic,
        blockNumber: q.blockNumber,
      })

      extrinsic.method.args.forEach((data, index) => {
        const name = extrinsic.meta.args[index].name.toString()
        const value = (data.toJSON() || '') as AnyJsonField
        const type = data.toRawType()

        extrinsicArgs[name] = { type, value }
      })
    }

    _entity.extrinsicArgs = extrinsicArgs

    // debug(`Event entity: ${JSON.stringify(_entity, null, 2)}`);

    return _entity
  }
}
