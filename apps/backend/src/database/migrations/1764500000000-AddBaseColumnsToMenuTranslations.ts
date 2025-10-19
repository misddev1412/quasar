import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseColumnsToMenuTranslations1764500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "menu_translations"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "created_by" uuid,
      ADD COLUMN IF NOT EXISTS "updated_by" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "menu_translations"
      DROP COLUMN IF EXISTS "version",
      DROP COLUMN IF EXISTS "created_by",
      DROP COLUMN IF EXISTS "updated_by"
    `);
  }
}
