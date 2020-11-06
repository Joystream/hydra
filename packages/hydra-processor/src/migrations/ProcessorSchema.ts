import { MigrationInterface, QueryRunner } from 'typeorm'

export class ProcessorSchema implements MigrationInterface {
  name = 'IndexerSchema1601637366182'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "processed_events_log" ("id" SERIAL NOT NULL, "processor" character varying NOT NULL, "event_id" character varying NOT NULL, "last_scanned_block" integer NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d074516252c7a3090ddc44b9a5" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_1038d15b8a821947029f3a7d4e" ON "processed_events_log" ("event_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_1038d15b8a821947029f3a7d4e"`)
    await queryRunner.query(`DROP TABLE "processed_events_log"`)
  }
}
