import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationPreferencesTable1763000000000 implements MigrationInterface {
  name = 'CreateNotificationPreferencesTable1763000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" varchar(50) NOT NULL,
        "channel" varchar(20) NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "frequency" varchar(20) NOT NULL DEFAULT 'immediate',
        "quiet_hours_start" varchar(5),
        "quiet_hours_end" varchar(5),
        "quiet_hours_timezone" varchar(50),
        "settings" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_preferences" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notification_preferences_user_id" ON "notification_preferences" ("user_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "notification_preferences" ADD CONSTRAINT "UQ_notification_preferences_user_type_channel" UNIQUE ("user_id", "type", "channel")
    `);

    await queryRunner.query(`
      ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_notification_preferences_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Insert default preferences for existing users
    await queryRunner.query(`
      INSERT INTO notification_preferences (user_id, type, channel, enabled, frequency)
      SELECT
        u.id as user_id,
        nt.type,
        nc.channel,
        true as enabled,
        'immediate' as frequency
      FROM users u
      CROSS JOIN (
        VALUES
          ('info'),
          ('success'),
          ('warning'),
          ('error'),
          ('system'),
          ('product'),
          ('order'),
          ('user')
      ) AS nt(type)
      CROSS JOIN (
        VALUES
          ('push'),
          ('email'),
          ('in_app')
      ) AS nc(channel)
      ON CONFLICT (user_id, type, channel) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_notification_preferences_user"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "UQ_notification_preferences_user_type_channel"`);
    await queryRunner.query(`DROP INDEX "IDX_notification_preferences_user_id"`);
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
  }
}