import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateThemesTable1773400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "themes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP NULL,
        "created_by" uuid NULL,
        "updated_by" uuid NULL,
        "deleted_by" uuid NULL,
        "version" INT NOT NULL DEFAULT 1,
        "name" VARCHAR(150) NOT NULL,
        "slug" VARCHAR(160) NOT NULL,
        "description" TEXT NULL,
        "mode" VARCHAR(10) NOT NULL DEFAULT 'light',
        "body_background_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
        "surface_background_color" VARCHAR(50) NOT NULL DEFAULT '#f8fafc',
        "text_color" VARCHAR(50) NOT NULL DEFAULT '#0f172a',
        "muted_text_color" VARCHAR(50) NOT NULL DEFAULT '#475569',
        "primary_color" VARCHAR(50) NOT NULL DEFAULT '#2563eb',
        "primary_text_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
        "secondary_color" VARCHAR(50) NOT NULL DEFAULT '#0ea5e9',
        "secondary_text_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
        "accent_color" VARCHAR(50) NOT NULL DEFAULT '#7c3aed',
        "border_color" VARCHAR(50) NOT NULL DEFAULT '#e2e8f0',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "is_default" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "UQ_themes_slug" UNIQUE ("slug")
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_themes_slug" ON "themes" ("slug")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_themes_is_active" ON "themes" ("is_active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_themes_is_default" ON "themes" ("is_default")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_themes_is_default"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_themes_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_themes_slug"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "themes"`);
  }
}
