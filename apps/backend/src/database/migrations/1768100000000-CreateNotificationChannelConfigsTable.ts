import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationChannelConfigsTable1768100000000 implements MigrationInterface {
  name = 'CreateNotificationChannelConfigsTable1768100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notification_channel_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_key" varchar(120) NOT NULL,
        "display_name" varchar(150) NOT NULL,
        "description" text,
        "allowed_channels" jsonb NOT NULL DEFAULT '[]',
        "is_active" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_channel_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_channel_configs_event_key" UNIQUE ("event_key")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "notification_channel_configs" (event_key, display_name, description, allowed_channels)
      VALUES
        (
          'user.registered',
          'User Registration',
          'Triggered when a customer creates a new account',
          '["email","sms","telegram","in_app"]'::jsonb
        ),
        (
          'user.verified',
          'User Verification',
          'Account verification success/failure notifications',
          '["email","push","in_app"]'::jsonb
        ),
        (
          'order.created',
          'Order Created',
          'Customer placed an order',
          '["email","push","sms","in_app"]'::jsonb
        ),
        (
          'order.shipped',
          'Order Shipped',
          'Logistics update when the parcel leaves the warehouse',
          '["email","push","sms"]'::jsonb
        ),
        (
          'marketing.campaign',
          'Marketing Campaign',
          'Campaign pushes and promotional messages',
          '["email","push","telegram"]'::jsonb
        ),
        (
          'system.announcement',
          'System Announcement',
          'System-wide broadcast sent by administrators',
          '["email","push","in_app"]'::jsonb
        ),
        (
          'custom.manual',
          'Manual / Custom',
          'Fallback event for ad-hoc notifications',
          '["email","push","in_app"]'::jsonb
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notification_channel_configs"`);
  }
}
