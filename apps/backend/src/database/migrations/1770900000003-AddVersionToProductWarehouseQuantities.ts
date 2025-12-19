import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionToProductWarehouseQuantities1770900000003 implements MigrationInterface {
  name = 'AddVersionToProductWarehouseQuantities1770900000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_warehouse_quantities"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_warehouse_quantities"
      DROP COLUMN IF EXISTS "version"
    `);
  }
}
