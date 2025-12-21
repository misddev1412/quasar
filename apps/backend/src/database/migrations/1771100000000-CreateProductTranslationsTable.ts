import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTranslationsTable1771100000000 implements MigrationInterface {
    name = 'CreateProductTranslationsTable1771100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product_translations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "product_id" uuid NOT NULL,
                "locale" varchar(5) NOT NULL,
                "name" varchar(255),
                "description" text,
                "slug" varchar(255),
                "meta_title" varchar(255),
                "meta_description" text,
                "meta_keywords" text,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "version" int DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "product_translations"
            ADD CONSTRAINT "FK_product_translations_product_id"
            FOREIGN KEY ("product_id") REFERENCES "products" ("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_PRODUCT_TRANSLATION_PRODUCT_LOCALE"
            ON "product_translations" ("product_id", "locale")
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_PRODUCT_TRANSLATION_LOCALE_SLUG"
            ON "product_translations" ("locale", "slug")
            WHERE slug IS NOT NULL
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_PRODUCT_TRANSLATION_LOCALE"
            ON "product_translations" ("locale")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_PRODUCT_TRANSLATION_PRODUCT"
            ON "product_translations" ("product_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_translations"`);
    }

}
