import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThemeColorModes1773650000000 implements MigrationInterface {
  name = 'AddThemeColorModes1773650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "themes"
      ADD COLUMN "color_modes" jsonb NOT NULL DEFAULT '{}'::jsonb;
    `);

    await queryRunner.query(`
      UPDATE "themes"
      SET "color_modes" = jsonb_build_object(
        'light', jsonb_build_object(
          'bodyBackgroundColor', COALESCE("body_background_color", '#ffffff'),
          'surfaceBackgroundColor', COALESCE("surface_background_color", '#f8fafc'),
          'textColor', COALESCE("text_color", '#0f172a'),
          'mutedTextColor', COALESCE("muted_text_color", '#475569'),
          'primaryColor', COALESCE("primary_color", '#2563eb'),
          'primaryTextColor', COALESCE("primary_text_color", '#ffffff'),
          'secondaryColor', COALESCE("secondary_color", '#0ea5e9'),
          'secondaryTextColor', COALESCE("secondary_text_color", '#ffffff'),
          'accentColor', COALESCE("accent_color", '#7c3aed'),
          'borderColor', COALESCE("border_color", '#e2e8f0')
        ),
        'dark', jsonb_build_object(
          'bodyBackgroundColor', COALESCE("body_background_color", '#ffffff'),
          'surfaceBackgroundColor', COALESCE("surface_background_color", '#f8fafc'),
          'textColor', COALESCE("text_color", '#0f172a'),
          'mutedTextColor', COALESCE("muted_text_color", '#475569'),
          'primaryColor', COALESCE("primary_color", '#2563eb'),
          'primaryTextColor', COALESCE("primary_text_color", '#ffffff'),
          'secondaryColor', COALESCE("secondary_color", '#0ea5e9'),
          'secondaryTextColor', COALESCE("secondary_text_color", '#ffffff'),
          'accentColor', COALESCE("accent_color", '#7c3aed'),
          'borderColor', COALESCE("border_color", '#e2e8f0')
        )
      );
    `);

    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "body_background_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "surface_background_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "text_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "muted_text_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "primary_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "primary_text_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "secondary_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "secondary_text_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "accent_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "border_color"`);
    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "mode"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "theme_mode_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "themes"
      ADD COLUMN "body_background_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
      ADD COLUMN "surface_background_color" VARCHAR(50) NOT NULL DEFAULT '#f8fafc',
      ADD COLUMN "text_color" VARCHAR(50) NOT NULL DEFAULT '#0f172a',
      ADD COLUMN "muted_text_color" VARCHAR(50) NOT NULL DEFAULT '#475569',
      ADD COLUMN "primary_color" VARCHAR(50) NOT NULL DEFAULT '#2563eb',
      ADD COLUMN "primary_text_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
      ADD COLUMN "secondary_color" VARCHAR(50) NOT NULL DEFAULT '#0ea5e9',
      ADD COLUMN "secondary_text_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
      ADD COLUMN "accent_color" VARCHAR(50) NOT NULL DEFAULT '#7c3aed',
      ADD COLUMN "border_color" VARCHAR(50) NOT NULL DEFAULT '#e2e8f0';
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_mode_enum') THEN
          CREATE TYPE "theme_mode_enum" AS ENUM ('LIGHT', 'DARK');
        END IF;
      END$$;
    `);

    await queryRunner.query(`ALTER TABLE "themes" ADD COLUMN "mode" "theme_mode_enum" NOT NULL DEFAULT 'LIGHT'`);

    await queryRunner.query(`
      UPDATE "themes"
      SET
        "body_background_color" = COALESCE("color_modes"->'light'->>'bodyBackgroundColor', '#ffffff'),
        "surface_background_color" = COALESCE("color_modes"->'light'->>'surfaceBackgroundColor', '#f8fafc'),
        "text_color" = COALESCE("color_modes"->'light'->>'textColor', '#0f172a'),
        "muted_text_color" = COALESCE("color_modes"->'light'->>'mutedTextColor', '#475569'),
        "primary_color" = COALESCE("color_modes"->'light'->>'primaryColor', '#2563eb'),
        "primary_text_color" = COALESCE("color_modes"->'light'->>'primaryTextColor', '#ffffff'),
        "secondary_color" = COALESCE("color_modes"->'light'->>'secondaryColor', '#0ea5e9'),
        "secondary_text_color" = COALESCE("color_modes"->'light'->>'secondaryTextColor', '#ffffff'),
        "accent_color" = COALESCE("color_modes"->'light'->>'accentColor', '#7c3aed'),
        "border_color" = COALESCE("color_modes"->'light'->>'borderColor', '#e2e8f0'),
        "mode" = 'LIGHT';
    `);

    await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "color_modes"`);
  }
}
