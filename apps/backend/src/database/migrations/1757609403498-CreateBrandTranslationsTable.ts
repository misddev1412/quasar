import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBrandTranslationsTable1757609403498 implements MigrationInterface {
    name = 'CreateBrandTranslationsTable1757609403498';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create brand_translations table
        await queryRunner.query(`
            CREATE TABLE "brand_translations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "brand_id" uuid NOT NULL,
                "locale" varchar(5) NOT NULL,
                "name" varchar(255),
                "description" text,
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "brand_translations"
            ADD CONSTRAINT "FK_brand_translations_brand_id"
            FOREIGN KEY ("brand_id") REFERENCES "brands" ("id")
            ON DELETE CASCADE
        `);

        // Add unique constraint for brand_id + locale
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_BRAND_TRANSLATIONS_BRAND_ID_LOCALE"
            ON "brand_translations" ("brand_id", "locale")
        `);

        // Add index for locale
        await queryRunner.query(`
            CREATE INDEX "IDX_BRAND_TRANSLATIONS_LOCALE"
            ON "brand_translations" ("locale")
        `);

        // Add index for brand_id
        await queryRunner.query(`
            CREATE INDEX "IDX_BRAND_TRANSLATIONS_BRAND_ID"
            ON "brand_translations" ("brand_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "brand_translations"`);
    }

}
