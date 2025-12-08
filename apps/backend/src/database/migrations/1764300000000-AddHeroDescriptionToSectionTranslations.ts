import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHeroDescriptionToSectionTranslations1764300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "section_translations"
      ADD COLUMN IF NOT EXISTS "hero_description" text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "section_translations"
      DROP COLUMN IF EXISTS "hero_description";
    `);
  }
}
