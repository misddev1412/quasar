import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryItemsTable1762950000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_variant_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "location_id" uuid,
        "quantity" integer NOT NULL DEFAULT 0,
        "reserved_quantity" integer NOT NULL DEFAULT 0,
        "unit_cost" decimal(10,2) NOT NULL DEFAULT 0,
        "last_restocked_at" timestamp,
        "low_stock_threshold" integer,
        "batch_number" character varying(100),
        "expiry_date" date,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_inventory_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_inventory_items_variant_warehouse" UNIQUE ("product_variant_id", "warehouse_id"),
        CONSTRAINT "FK_inventory_items_variant" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventory_items_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventory_items_location" FOREIGN KEY ("location_id") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_warehouse" ON "inventory_items" ("warehouse_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_location" ON "inventory_items" ("location_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_quantity" ON "inventory_items" ("quantity")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_expiry" ON "inventory_items" ("expiry_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory_items"`);
  }
}