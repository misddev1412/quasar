import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductReviews1772000000001 implements MigrationInterface {
  name = 'CreateProductReviews1772000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "view_count" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "sold_count" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "product_id" uuid NOT NULL,
        "customer_id" uuid,
        "user_name" character varying(255),
        "user_avatar" text,
        "rating" numeric(3,2) NOT NULL,
        "title" character varying(255),
        "comment" text,
        "verified_purchase" boolean NOT NULL DEFAULT false,
        "helpful_count" integer NOT NULL DEFAULT 0,
        "status" character varying(20) NOT NULL DEFAULT 'PENDING',
        CONSTRAINT "PK_product_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_product_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "CHK_product_reviews_status" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_product_reviews_product_id"
      ON "product_reviews" ("product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_product_reviews_status"
      ON "product_reviews" ("status")
    `);

    await queryRunner.query(`
      ALTER TABLE "product_reviews"
      ADD CONSTRAINT "FK_product_reviews_product_id"
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "product_reviews"
      ADD CONSTRAINT "FK_product_reviews_customer_id"
      FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_reviews" DROP CONSTRAINT IF EXISTS "FK_product_reviews_customer_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_reviews" DROP CONSTRAINT IF EXISTS "FK_product_reviews_product_id"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_product_reviews_status"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_product_reviews_product_id"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "product_reviews"
    `);

    await queryRunner.query(`
      ALTER TABLE "products" DROP COLUMN IF EXISTS "sold_count"
    `);
    await queryRunner.query(`
      ALTER TABLE "products" DROP COLUMN IF EXISTS "view_count"
    `);
  }
}
