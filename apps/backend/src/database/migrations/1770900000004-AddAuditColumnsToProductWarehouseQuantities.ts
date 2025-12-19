import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditColumnsToProductWarehouseQuantities1770900000004 implements MigrationInterface {
  name = 'AddAuditColumnsToProductWarehouseQuantities1770900000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_warehouse_quantities"
      ADD COLUMN IF NOT EXISTS "created_by" uuid NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "product_warehouse_quantities"
      ADD COLUMN IF NOT EXISTS "updated_by" uuid NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_warehouse_quantities"
      DROP COLUMN IF EXISTS "updated_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "product_warehouse_quantities"
      DROP COLUMN IF EXISTS "created_by"
    `);
  }
}
