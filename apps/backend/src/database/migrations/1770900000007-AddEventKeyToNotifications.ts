import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventKeyToNotifications1770900000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD COLUMN IF NOT EXISTS "event_key" varchar(100)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_event_key"
      ON "notifications" ("event_key")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_notifications_event_key"
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications"
      DROP COLUMN IF EXISTS "event_key"
    `);
  }
}
