import { MigrationInterface, QueryRunner } from 'typeorm'

export class WarthogSchemaMigration implements MigrationInterface {
  name = 'WarthogSchemaMigration1600174725705'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(
    //   `CREATE TABLE "runtime" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "impl_version" character varying, "impl_name" character varying NOT NULL, "spec_version" integer NOT NULL, "spec_name" character varying, "authoring_version" integer, "apis" jsonb, "metadata" jsonb, CONSTRAINT "PK_dbc73e344f0cca99c1a61c79b22" PRIMARY KEY ("id"))`
    // );
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "created_by_id" character varying NOT NULL DEFAULT 'indexer' `
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "updated_at" TIMESTAMP DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "updated_by_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "deleted_at" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "deleted_by_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "version" integer NOT NULL DEFAULT 0 `
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "created_by_id" character varying NOT NULL DEFAULT 'indexer'`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "updated_at" TIMESTAMP DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "updated_by_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "deleted_at" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "deleted_by_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "version" integer NOT NULL DEFAULT 0`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP CONSTRAINT "FK_039d734d88baa87b2a46c951175"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "extrinsic_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD "extrinsic_id" integer`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD CONSTRAINT "REL_039d734d88baa87b2a46c95117" UNIQUE ("extrinsic_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "block_number"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "block_number" numeric NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP CONSTRAINT "PK_a4c7ce64007d5d29f412c071373"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD "id" SERIAL NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" ADD CONSTRAINT "PK_a4c7ce64007d5d29f412c071373" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" ADD CONSTRAINT "FK_039d734d88baa87b2a46c951175" FOREIGN KEY ("extrinsic_id") REFERENCES "substrate_extrinsic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "version"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "deleted_by_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "deleted_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "updated_by_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "updated_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "created_by_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_event" DROP COLUMN "created_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "version"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "deleted_by_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "deleted_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "updated_by_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "updated_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "created_by_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "substrate_extrinsic" DROP COLUMN "created_at"`
    )
    await queryRunner.query(`DROP TABLE "runtime"`)
  }
}
