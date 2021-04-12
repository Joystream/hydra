import { MigrationInterface, QueryRunner } from 'typeorm'

export class SubstrateBlock1618247736427 implements MigrationInterface {
  name = 'SubstrateBlock1618247736427'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "substrate_block" ("height" integer NOT NULL, "timestamp" bigint NOT NULL, "hash" character varying NOT NULL, "parent_hash" character varying NOT NULL, "state_root" character varying NOT NULL, "extrinsics_root" character varying NOT NULL, "runtime_version" jsonb NOT NULL, "last_runtime_upgrade" jsonb NOT NULL, "events" jsonb NOT NULL, "extrinsics" jsonb NOT NULL, CONSTRAINT "PK_1c466d50a1051e61740ca39d5d6" PRIMARY KEY ("hash"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_0a079b7de8677bf14e3ce7eae5" ON "substrate_block" ("height") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_4d1f3ccae8198d4e845ec71961" ON "substrate_block" ("parent_hash") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_7d79b7ab5c7dbab3a5afd21f9f" ON "substrate_block" ("runtime_version") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_48cb0cbc21079c405bfc7142c9" ON "substrate_block" ("last_runtime_upgrade") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_399ddfba75dab85307eb211e3e" ON "substrate_block" ("events") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_0e02844136ea2e4682f1c43b4c" ON "substrate_block" ("extrinsics") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_0e02844136ea2e4682f1c43b4c"`)
    await queryRunner.query(`DROP INDEX "IDX_399ddfba75dab85307eb211e3e"`)
    await queryRunner.query(`DROP INDEX "IDX_48cb0cbc21079c405bfc7142c9"`)
    await queryRunner.query(`DROP INDEX "IDX_7d79b7ab5c7dbab3a5afd21f9f"`)
    await queryRunner.query(`DROP INDEX "IDX_4d1f3ccae8198d4e845ec71961"`)
    await queryRunner.query(`DROP INDEX "IDX_0a079b7de8677bf14e3ce7eae5"`)
    await queryRunner.query(`DROP TABLE "substrate_block"`)
  }
}
