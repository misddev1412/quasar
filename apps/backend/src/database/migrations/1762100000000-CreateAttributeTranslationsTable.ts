import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttributeTranslationsTable1762100000000 implements MigrationInterface {
    name = 'CreateAttributeTranslationsTable1762100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create attribute_translations table
        await queryRunner.query(`
            CREATE TABLE "attribute_translations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "attribute_id" uuid NOT NULL,
                "locale" varchar(5) NOT NULL,
                "display_name" varchar(255) NOT NULL,
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "attribute_translations"
            ADD CONSTRAINT "FK_attribute_translations_attribute_id"
            FOREIGN KEY ("attribute_id") REFERENCES "attributes" ("id")
            ON DELETE CASCADE
        `);

        // Add unique constraint for attribute_id + locale
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_ATTRIBUTE_TRANSLATIONS_ATTRIBUTE_ID_LOCALE"
            ON "attribute_translations" ("attribute_id", "locale")
        `);

        // Add index for locale
        await queryRunner.query(`
            CREATE INDEX "IDX_ATTRIBUTE_TRANSLATIONS_LOCALE"
            ON "attribute_translations" ("locale")
        `);

        // Add index for attribute_id
        await queryRunner.query(`
            CREATE INDEX "IDX_ATTRIBUTE_TRANSLATIONS_ATTRIBUTE_ID"
            ON "attribute_translations" ("attribute_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "attribute_translations"`);
    }
}