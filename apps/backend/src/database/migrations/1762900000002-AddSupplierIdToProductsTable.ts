import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupplierIdToProductsTable1762900000002 implements MigrationInterface {
  name = 'AddSupplierIdToProductsTable1762900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add supplier_id column to products table (if it doesn't exist)
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "supplier_id" uuid
    `);

    // Create index for supplier_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_supplier_id"
      ON "products" ("supplier_id")
    `);

    // Create foreign key relationship
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_supplier_id"
      FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "FK_products_supplier_id"
    `);

    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_products_supplier_id"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "supplier_id"
    `);
  }
}