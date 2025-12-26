import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServicesTables1773000000000 implements MigrationInterface {
    name = 'CreateServicesTables1773000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Services table
        await queryRunner.query(`
            CREATE TABLE "services" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "unit_price" decimal(10,2) NOT NULL DEFAULT '0',
                "currency_id" uuid,
                "is_contact_price" boolean NOT NULL DEFAULT false,
                "thumbnail" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Service Translations table
        await queryRunner.query(`
            CREATE TABLE "service_translations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "service_id" uuid NOT NULL,
                "locale" varchar(5) NOT NULL,
                "name" varchar(255),
                "content" text,
                "description" text,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Service Items table
        await queryRunner.query(`
            CREATE TABLE "service_items" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "service_id" uuid NOT NULL,
                "price" decimal(10,2),
                "sort_order" int NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Service Item Translations table
        await queryRunner.query(`
            CREATE TABLE "service_item_translations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "service_item_id" uuid NOT NULL,
                "locale" varchar(5) NOT NULL,
                "name" varchar(255),
                "description" text,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Foreign Keys & Indexes

        // services.currency_id -> currencies.id (Assuming currencies table exists and id is uuid)
        // Note: The entity has lazy relation, but usually we want DB constraint.
        // If currency table created in 1765500000000, it exists.
        await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "FK_services_currency_id"
            FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id")
            ON DELETE SET NULL
        `);

        // service_translations.service_id
        await queryRunner.query(`
            ALTER TABLE "service_translations"
            ADD CONSTRAINT "FK_service_translations_service_id"
            FOREIGN KEY ("service_id") REFERENCES "services" ("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_SERVICE_TRANSLATIONS_SERVICE_LOCALE"
            ON "service_translations" ("service_id", "locale")
        `);

        // service_items.service_id
        await queryRunner.query(`
            ALTER TABLE "service_items"
            ADD CONSTRAINT "FK_service_items_service_id"
            FOREIGN KEY ("service_id") REFERENCES "services" ("id")
            ON DELETE CASCADE
        `);

        // service_item_translations.service_item_id
        await queryRunner.query(`
            ALTER TABLE "service_item_translations"
            ADD CONSTRAINT "FK_service_item_translations_service_item_id"
            FOREIGN KEY ("service_item_id") REFERENCES "service_items" ("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_SERVICE_ITEM_TRANSLATIONS_ITEM_LOCALE"
            ON "service_item_translations" ("service_item_id", "locale")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "service_item_translations"`);
        await queryRunner.query(`DROP TABLE "service_items"`);
        await queryRunner.query(`DROP TABLE "service_translations"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }
}
