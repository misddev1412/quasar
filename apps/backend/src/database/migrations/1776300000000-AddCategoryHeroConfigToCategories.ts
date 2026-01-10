import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryHeroConfigToCategories1776300000000 implements MigrationInterface {
  name = 'AddCategoryHeroConfigToCategories1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "hero_background_image" character varying(500)
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "show_title" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "show_product_count" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "show_subcategory_count" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "show_cta" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "cta_label" character varying(255)
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "cta_url" character varying(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "cta_url"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "cta_label"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "show_cta"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "show_subcategory_count"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "show_product_count"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "show_title"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "hero_background_image"`);
  }
}
