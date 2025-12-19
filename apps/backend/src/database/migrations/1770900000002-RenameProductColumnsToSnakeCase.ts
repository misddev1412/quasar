import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductColumnsToSnakeCase1770900000002 implements MigrationInterface {
  name = 'RenameProductColumnsToSnakeCase1770900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if old columns exist before renaming
    const productsTableExists = await queryRunner.hasTable('products');
    if (productsTableExists) {
      // Rename stockQuantity to stock_quantity in products table
      const stockQuantityExists = await queryRunner.hasColumn('products', 'stockQuantity');
      if (stockQuantityExists) {
        // Drop the old index first
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_stock_quantity"`);

        await queryRunner.query(`
          ALTER TABLE "products"
          RENAME COLUMN "stockQuantity" TO "stock_quantity"
        `);

        // Create new index with correct column name
        await queryRunner.query(`
          CREATE INDEX "IDX_products_stock_quantity" ON "products" ("stock_quantity")
        `);
      }

      // Rename enableWarehouseQuantity to enable_warehouse_quantity in products table
      const enableWarehouseExists = await queryRunner.hasColumn('products', 'enableWarehouseQuantity');
      if (enableWarehouseExists) {
        await queryRunner.query(`
          ALTER TABLE "products"
          RENAME COLUMN "enableWarehouseQuantity" TO "enable_warehouse_quantity"
        `);
      }
    }

    // Rename columns in product_warehouse_quantities table
    const warehouseQuantitiesExists = await queryRunner.hasTable('product_warehouse_quantities');
    if (warehouseQuantitiesExists) {
      // Rename createdAt to created_at
      const createdAtExists = await queryRunner.hasColumn('product_warehouse_quantities', 'createdAt');
      if (createdAtExists) {
        await queryRunner.query(`
          ALTER TABLE "product_warehouse_quantities"
          RENAME COLUMN "createdAt" TO "created_at"
        `);
      }

      // Rename updatedAt to updated_at
      const updatedAtExists = await queryRunner.hasColumn('product_warehouse_quantities', 'updatedAt');
      if (updatedAtExists) {
        await queryRunner.query(`
          ALTER TABLE "product_warehouse_quantities"
          RENAME COLUMN "updatedAt" TO "updated_at"
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert product_warehouse_quantities table columns
    const warehouseQuantitiesExists = await queryRunner.hasTable('product_warehouse_quantities');
    if (warehouseQuantitiesExists) {
      const updatedAtExists = await queryRunner.hasColumn('product_warehouse_quantities', 'updated_at');
      if (updatedAtExists) {
        await queryRunner.query(`
          ALTER TABLE "product_warehouse_quantities"
          RENAME COLUMN "updated_at" TO "updatedAt"
        `);
      }

      const createdAtExists = await queryRunner.hasColumn('product_warehouse_quantities', 'created_at');
      if (createdAtExists) {
        await queryRunner.query(`
          ALTER TABLE "product_warehouse_quantities"
          RENAME COLUMN "created_at" TO "createdAt"
        `);
      }
    }

    // Revert products table columns
    const productsTableExists = await queryRunner.hasTable('products');
    if (productsTableExists) {
      const enableWarehouseExists = await queryRunner.hasColumn('products', 'enable_warehouse_quantity');
      if (enableWarehouseExists) {
        await queryRunner.query(`
          ALTER TABLE "products"
          RENAME COLUMN "enable_warehouse_quantity" TO "enableWarehouseQuantity"
        `);
      }

      const stockQuantityExists = await queryRunner.hasColumn('products', 'stock_quantity');
      if (stockQuantityExists) {
        // Drop the index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_stock_quantity"`);

        await queryRunner.query(`
          ALTER TABLE "products"
          RENAME COLUMN "stock_quantity" TO "stockQuantity"
        `);

        // Recreate index with old column name
        await queryRunner.query(`
          CREATE INDEX "IDX_products_stock_quantity" ON "products" ("stockQuantity")
        `);
      }
    }
  }
}
