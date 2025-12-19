import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceToProducts1770900000005 implements MigrationInterface {
  name = 'AddPriceToProducts1770900000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "price" numeric(10,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "price"
    `);
  }
}
