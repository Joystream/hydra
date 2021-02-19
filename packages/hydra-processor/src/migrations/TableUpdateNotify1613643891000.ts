import { MigrationInterface, QueryRunner } from 'typeorm'

export class TableUpdateNotify1613643891000 implements MigrationInterface {
  name = 'TableUpdateNotify1613643891000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
      DECLARE
        id text;
      BEGIN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          id = NEW.id::text;
        ELSE
          id = OLD.id::text;
        END IF;
        PERFORM pg_notify(TG_TABLE_NAME || '_update', json_build_object('id', id, 'type', TG_OP, 'data', row_to_json(NEW.*))::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROM FUNCTION table_update_notify()`)
  }
}
