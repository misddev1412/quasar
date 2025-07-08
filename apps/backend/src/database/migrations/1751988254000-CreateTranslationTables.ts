import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTranslationTables1751988254000 implements MigrationInterface {
    name = 'CreateTranslationTables1751988254000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create translations table with raw SQL
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "translations" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "key" character varying NOT NULL,
                "locale" character varying(5) NOT NULL,
                "value" text NOT NULL,
                "namespace" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_translations" PRIMARY KEY ("id")
            )
        `);

        // Create unique index on key and locale
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_translation_key_locale" 
            ON "translations" ("key", "locale")
        `);

        // Create index on namespace for faster filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_translation_namespace" 
            ON "translations" ("namespace")
        `);

        // Create index on is_active for faster filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_translation_is_active" 
            ON "translations" ("is_active")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_translation_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_translation_namespace"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_translation_key_locale"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE IF EXISTS "translations"`);
    }
} 