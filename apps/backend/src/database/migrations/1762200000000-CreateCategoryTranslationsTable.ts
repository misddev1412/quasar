import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryTranslationsTable1762200000000 implements MigrationInterface {
    name = 'CreateCategoryTranslationsTable1762200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create category_translations table
        await queryRunner.query(`
            CREATE TABLE "category_translations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "category_id" uuid NOT NULL,
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
            ALTER TABLE "category_translations"
            ADD CONSTRAINT "FK_category_translations_category_id"
            FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
            ON DELETE CASCADE
        `);

        // Add unique constraint for category_id + locale
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_CATEGORY_TRANSLATIONS_CATEGORY_ID_LOCALE"
            ON "category_translations" ("category_id", "locale")
        `);

        // Add index for locale
        await queryRunner.query(`
            CREATE INDEX "IDX_CATEGORY_TRANSLATIONS_LOCALE"
            ON "category_translations" ("locale")
        `);

        // Add index for category_id
        await queryRunner.query(`
            CREATE INDEX "IDX_CATEGORY_TRANSLATIONS_CATEGORY_ID"
            ON "category_translations" ("category_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "category_translations"`);
    }

}