import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehouseLocationsTable1762950000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "warehouse_locations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "warehouse_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "code" character varying(100) NOT NULL,
        "type" character varying(10) NOT NULL DEFAULT 'SHELF' CHECK ("type" IN ('ZONE', 'AISLE', 'SHELF', 'BIN')),
        "description" text,
        "parent_location_id" uuid,
        "max_capacity" integer,
        "current_capacity" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_warehouse_locations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_warehouse_locations_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_warehouse_locations_parent" FOREIGN KEY ("parent_location_id") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_warehouse_locations_warehouse_id" ON "warehouse_locations" ("warehouse_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_warehouse_locations_code" ON "warehouse_locations" ("warehouse_id", "code")`);
    await queryRunner.query(`CREATE INDEX "IDX_warehouse_locations_parent" ON "warehouse_locations" ("parent_location_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_warehouse_locations_type" ON "warehouse_locations" ("type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "warehouse_locations"`);
  }
}