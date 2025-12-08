import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1758213741697 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "title" varchar(255) NOT NULL,
                "body" text NOT NULL,
                "type" varchar(50) NOT NULL DEFAULT 'info',
                "action_url" varchar(500),
                "icon" varchar(255),
                "image" varchar(500),
                "data" jsonb,
                "read" boolean NOT NULL DEFAULT false,
                "fcm_token" varchar(500),
                "sent_at" TIMESTAMP,
                "read_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_read" ON "notifications" ("read")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_type" ON "notifications" ("type")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at")
        `);

        await queryRunner.query(`
            ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_type"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_read"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_user_id"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
    }

}
