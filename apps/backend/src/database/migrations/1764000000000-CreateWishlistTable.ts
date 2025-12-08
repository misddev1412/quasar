import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWishlistTable1764000000000 implements MigrationInterface {
  name = 'CreateWishlistTable1764000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wishlists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "priority" integer NOT NULL DEFAULT 0,
        "notes" text,
        "is_public" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "PK_wishlists" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wishlists_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_wishlists_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_wishlists_customer_product" UNIQUE ("customer_id", "product_id")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_wishlists_customer_id" ON "wishlists" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_wishlists_product_id" ON "wishlists" ("product_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_wishlists_created_at" ON "wishlists" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_wishlists_priority" ON "wishlists" ("priority")`);
    await queryRunner.query(`CREATE INDEX "IDX_wishlists_is_public" ON "wishlists" ("is_public")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_wishlists_is_public"`);
    await queryRunner.query(`DROP INDEX "IDX_wishlists_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_wishlists_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_wishlists_product_id"`);
    await queryRunner.query(`DROP INDEX "IDX_wishlists_customer_id"`);
    await queryRunner.query(`DROP TABLE "wishlists"`);
  }
}