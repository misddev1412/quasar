import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductSpecificationsTable1764100000000 implements MigrationInterface {
  name = 'CreateProductSpecificationsTable1764100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_specifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "value" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "PK_product_specifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_specifications_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_product_specifications_product_id" ON "product_specifications" ("product_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_specifications_sort_order" ON "product_specifications" ("sort_order")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_product_specifications_sort_order"`);
    await queryRunner.query(`DROP INDEX "IDX_product_specifications_product_id"`);
    await queryRunner.query(`DROP TABLE "product_specifications"`);
  }
}
