import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductWarehouseQuantitiesTable1770900000001 implements MigrationInterface {
  name = 'CreateProductWarehouseQuantitiesTable1770900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_warehouse_quantities table
    await queryRunner.query(`
      CREATE TABLE "product_warehouse_quantities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 0,
        "reserved_quantity" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_warehouse_quantities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_warehouse_quantities_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_warehouse_quantities_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_product_warehouse_quantities_product_warehouse" UNIQUE ("product_id", "warehouse_id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_product_warehouse_quantities_product" ON "product_warehouse_quantities" ("product_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_warehouse_quantities_warehouse" ON "product_warehouse_quantities" ("warehouse_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_warehouse_quantities_quantity" ON "product_warehouse_quantities" ("quantity")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_product_warehouse_quantities_quantity"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_product_warehouse_quantities_warehouse"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_product_warehouse_quantities_product"
    `);

    // Drop table
    await queryRunner.query(`
      DROP TABLE "product_warehouse_quantities"
    `);
  }
}
