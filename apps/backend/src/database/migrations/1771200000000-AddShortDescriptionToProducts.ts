import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShortDescriptionToProducts1771200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "short_description" character varying(500)
    `);

    await queryRunner.query(`
      ALTER TABLE "product_translations"
      ADD COLUMN IF NOT EXISTS "short_description" character varying(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_translations"
      DROP COLUMN IF EXISTS "short_description"
    `);

    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "short_description"
    `);
  }
}
