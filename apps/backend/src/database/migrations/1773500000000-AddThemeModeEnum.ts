import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThemeModeEnum1773500000000 implements MigrationInterface {
  name = 'AddThemeModeEnum1773500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_mode_enum') THEN
          CREATE TYPE "theme_mode_enum" AS ENUM ('LIGHT', 'DARK');
        END IF;
      END$$;
    `);

    await queryRunner.query(`ALTER TABLE "themes" ALTER COLUMN "mode" DROP DEFAULT`);
    await queryRunner.query(`UPDATE "themes" SET "mode" = UPPER("mode") WHERE "mode" IS NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "themes"
      ALTER COLUMN "mode"
      TYPE "theme_mode_enum"
      USING "mode"::"theme_mode_enum";
    `);
    await queryRunner.query(`ALTER TABLE "themes" ALTER COLUMN "mode" SET DEFAULT 'LIGHT'::"theme_mode_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "themes" ALTER COLUMN "mode" DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE "themes"
      ALTER COLUMN "mode"
      TYPE VARCHAR(10)
      USING "mode"::text;
    `);
    await queryRunner.query(`UPDATE "themes" SET "mode" = LOWER("mode") WHERE "mode" IS NOT NULL`);
    await queryRunner.query(`ALTER TABLE "themes" ALTER COLUMN "mode" SET DEFAULT 'light'`);
    await queryRunner.query(`DROP TYPE IF EXISTS "theme_mode_enum"`);
  }
}
