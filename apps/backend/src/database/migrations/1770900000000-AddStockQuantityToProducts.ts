import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockQuantityToProducts1770900000000 implements MigrationInterface {
  name = 'AddStockQuantityToProducts1770900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add stock_quantity column to products table
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "stock_quantity" integer NOT NULL DEFAULT 0
    `);

    // Add enable_warehouse_quantity column to products table
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "enable_warehouse_quantity" boolean NOT NULL DEFAULT false
    `);

    // Create index for stock_quantity for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_products_stock_quantity" ON "products" ("stock_quantity")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX "IDX_products_stock_quantity"
    `);

    // Drop enable_warehouse_quantity column
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "enable_warehouse_quantity"
    `);

    // Drop stock_quantity column
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "stock_quantity"
    `);
  }
}
