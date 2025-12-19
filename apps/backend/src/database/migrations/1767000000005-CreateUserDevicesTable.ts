import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserDevicesTable1767000000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "user_devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token" text NOT NULL,
        "platform" character varying,
        "device_id" character varying,
        "device_model" character varying,
        "os_version" character varying,
        "app_version" character varying,
        "last_active_at" timestamp NOT NULL DEFAULT now(),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_devices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_devices_user_token" UNIQUE ("user_id", "token")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_user_devices_user_id" ON "user_devices" ("user_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_user_devices_token" ON "user_devices" ("token")
    `);

        await queryRunner.query(`
      ALTER TABLE "user_devices" 
      ADD CONSTRAINT "FK_user_devices_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_devices" DROP CONSTRAINT "FK_user_devices_user"`);
        await queryRunner.query(`DROP INDEX "IDX_user_devices_token"`);
        await queryRunner.query(`DROP INDEX "IDX_user_devices_user_id"`);
        await queryRunner.query(`DROP TABLE "user_devices"`);
    }
}
