import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryHeroOverlayConfig1776400000000 implements MigrationInterface {
  name = 'AddCategoryHeroOverlayConfig1776400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "hero_overlay_enabled" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "hero_overlay_color" character varying(32)
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "hero_overlay_opacity" integer NOT NULL DEFAULT 70
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "hero_overlay_opacity"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "hero_overlay_color"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "hero_overlay_enabled"`);
  }
}
