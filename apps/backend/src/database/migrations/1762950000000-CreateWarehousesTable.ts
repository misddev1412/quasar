import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehousesTable1762950000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "warehouses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "code" character varying(100) NOT NULL,
        "description" text,
        "address" text,
        "city" character varying(100),
        "country" character varying(100),
        "postal_code" character varying(20),
        "phone" character varying(100),
        "email" character varying(100),
        "manager_name" character varying(100),
        "is_active" boolean NOT NULL DEFAULT true,
        "is_default" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_warehouses" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_warehouses_code" UNIQUE ("code")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_warehouses_code" ON "warehouses" ("code")`);
    await queryRunner.query(`CREATE INDEX "IDX_warehouses_is_active" ON "warehouses" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_warehouses_is_default" ON "warehouses" ("is_default")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "warehouses"`);
  }
}