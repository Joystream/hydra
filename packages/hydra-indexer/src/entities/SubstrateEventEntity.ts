import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Index,
} from 'typeorm'
import { AnyJson, AnyJsonField, EventParam } from '@dzlzv/hydra-common'
import { formatEventId, IQueryEvent } from '..'
import BN from 'bn.js'
import { SubstrateExtrinsicEntity } from './SubstrateExtrinsicEntity'
import { AbstractWarthogModel } from './AbstractWarthogModel'
import { NumericTransformer } from '@dzlzv/bn-typeorm'

export const EVENT_TABLE_NAME = 'substrate_event'

@Entity({
  name: EVENT_TABLE_NAME,
})
@Index(['blockNumber', 'index'], { unique: true })
export class SubstrateEventEntity extends AbstractWarthogModel {
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
  blockTimestamp!: BN

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

  static fromQueryEvent(q: IQueryEvent): SubstrateEventEntity {
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
      const e = q.extrinsic
      const extr = new SubstrateExtrinsicEntity()
      _entity.extrinsic = extr

      extr.blockNumber = q.blockNumber
      extr.signature = e.signature.toString()
      extr.signer = e.signer.toString()

      extr.method = e.method.method || 'NO_METHOD'
      extr.section = e.method.section || 'NO_SECTION'
      _entity.extrinsicName = `${extr.section}.${extr.method}`

      extr.meta = (e.meta.toJSON() || {}) as AnyJson
      extr.hash = e.hash.toString()
      _entity.extrinsicHash = extr.hash

      extr.isSigned = e.isSigned
      extr.tip = new BN(e.tip.toString())
      extr.versionInfo = e.version.toString()
      extr.nonce = e.nonce.toNumber()
      extr.era = (e.era.toJSON() || {}) as AnyJson

      extr.args = []

      e.method.args.forEach((data, index) => {
        const name = e.meta.args[index].name.toString()
        const value = data.toJSON() as AnyJsonField
        const type = data.toRawType()

        extr.args.push({
          type,
          value,
          name,
        })
        extrinsicArgs[name] = { type, value }
      })
    }

    _entity.extrinsicArgs = extrinsicArgs

    // debug(`Event entity: ${JSON.stringify(_entity, null, 2)}`);

    return _entity
  }
}
