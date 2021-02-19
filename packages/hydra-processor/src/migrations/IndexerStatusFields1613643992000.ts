import { MigrationInterface, QueryRunner } from 'typeorm'

export class IndexerStatusFields1613643992000 implements MigrationInterface {
  name = 'IndexerStatusFields1613643992000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_events_log" ADD COLUMN IF NOT EXISTS "indexer_head" numeric NOT NULL DEFAULT -1`
    )
    await queryRunner.query(
      `ALTER TABLE "processed_events_log" ADD COLUMN IF NOT EXISTS "chain_head" numeric NOT NULL DEFAULT -1`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_events_log" DROP COLUMN IF EXISTS "indexer_head"`
    )
    await queryRunner.query(
      `ALTER TABLE "processed_events_log" DROP COLUMN IF EXISTS "chain_head"`
    )
  }
}
