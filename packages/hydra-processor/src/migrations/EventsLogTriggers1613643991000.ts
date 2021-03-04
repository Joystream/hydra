import { MigrationInterface, QueryRunner } from 'typeorm'

export class EventsLogTriggers1613643991000 implements MigrationInterface {
  name = 'EventsLogTriggers1613643991000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS state_notify_insert ON "processed_events_log";
      CREATE TRIGGER state_notify_insert AFTER INSERT ON "processed_events_log" FOR EACH ROW EXECUTE PROCEDURE table_update_notify();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS state_notify_insert ON "processed_events_log"`
    )
  }
}
