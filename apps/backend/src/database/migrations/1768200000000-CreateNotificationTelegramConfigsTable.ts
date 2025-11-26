import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTelegramConfigsTable1768200000000 implements MigrationInterface {
  name = 'CreateNotificationTelegramConfigsTable1768200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notification_telegram_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(150) NOT NULL,
        "bot_username" varchar(150) NOT NULL,
        "bot_token" text NOT NULL,
        "chat_id" varchar(120) NOT NULL,
        "thread_id" integer,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_telegram_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_telegram_configs_name" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notification_telegram_configs"`);
  }
}
