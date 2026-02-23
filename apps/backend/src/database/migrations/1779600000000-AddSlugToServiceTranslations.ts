import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToServiceTranslations1779600000000 implements MigrationInterface {
  name = 'AddSlugToServiceTranslations1779600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_translations"
      ADD COLUMN "slug" varchar(255)
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_SERVICE_TRANSLATIONS_LOCALE_SLUG"
      ON "service_translations" ("locale", "slug")
      WHERE "slug" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_SERVICE_TRANSLATIONS_LOCALE_SLUG"
    `);

    await queryRunner.query(`
      ALTER TABLE "service_translations"
      DROP COLUMN "slug"
    `);
  }
}
