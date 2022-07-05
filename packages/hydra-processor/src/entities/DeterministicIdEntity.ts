import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({
  name: 'deterministic_id',
})
export class DeterministicIdEntity {
  @PrimaryColumn()
  className!: string

  @Column()
  highestId!: string

  // When the event is added to the database
  @Column('timestamp without time zone', {
    default: () => 'now()',
  })
  updatedAt!: Date
}
