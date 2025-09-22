import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockMovementsTable1762950000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "stock_movements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inventory_item_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "location_id" uuid,
        "type" character varying(15) NOT NULL CHECK ("type" IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'EXPIRED')),
        "reason" character varying(20) NOT NULL CHECK ("reason" IN ('PURCHASE', 'SALE', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'EXPIRED', 'INITIAL_STOCK')),
        "quantity" integer NOT NULL,
        "unit_cost" decimal(10,2),
        "reference_id" character varying(100),
        "reference_type" character varying(50),
        "notes" text,
        "user_id" uuid,
        "movement_date" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "previous_quantity" integer,
        "new_quantity" integer,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_movements_inventory_item" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_stock_movements_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_stock_movements_location" FOREIGN KEY ("location_id") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_stock_movements_inventory_item" ON "stock_movements" ("inventory_item_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_stock_movements_warehouse" ON "stock_movements" ("warehouse_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_stock_movements_type" ON "stock_movements" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_stock_movements_reason" ON "stock_movements" ("reason")`);
    await queryRunner.query(`CREATE INDEX "IDX_stock_movements_movement_date" ON "stock_movements" ("movement_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_stock_movements_reference" ON "stock_movements" ("reference_type", "reference_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_movements"`);
  }
}