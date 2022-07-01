import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({
  name: 'deterministic_id',
})
export class DeterministicIdEntity {
  @PrimaryGeneratedColumn()
  className!: string

  @Column()
  highestId!: string

  // When the event is added to the database
  @Column('timestamp without time zone', {
    default: () => 'now()',
  })
  updatedAt!: Date
}
