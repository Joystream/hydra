import { MigrationInterface, QueryRunner } from "typeorm"

export class DeterministicIdEntity1657020899263 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deterministic_id" (
        "class_name" character varying NOT NULL,
        "highest_id" character varying NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "PK_eb01f11c447ff2ae7910670ce42" PRIMARY KEY ("class_name")
      )`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "deterministic_id"`)
  }

}
