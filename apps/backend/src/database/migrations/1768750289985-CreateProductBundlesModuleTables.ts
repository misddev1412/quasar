import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductBundlesModuleTables1768750289985 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Parent Table: product_bundles
        await queryRunner.query(`
            CREATE TABLE "product_bundles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "version" integer NOT NULL DEFAULT 1,
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" text,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_product_bundles_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_product_bundles" PRIMARY KEY ("id")
            )
        `);

        // Create Enum
        await queryRunner.query(`
            CREATE TYPE "product_bundle_items_mode_enum" AS ENUM ('category', 'product');
        `);

        // Create Child Table: product_bundle_items
        await queryRunner.query(`
            CREATE TABLE "product_bundle_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "version" integer NOT NULL DEFAULT 1,
                "bundle_id" uuid NOT NULL,
                "label" character varying NOT NULL,
                "mode" "product_bundle_items_mode_enum" NOT NULL DEFAULT 'category',
                "position" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_product_bundle_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_product_bundle_items_bundle" FOREIGN KEY ("bundle_id") REFERENCES "product_bundles"("id") ON DELETE CASCADE
            )
        `);

        // Create Junction Table: product_bundle_item_categories
        await queryRunner.query(`
            CREATE TABLE "product_bundle_item_categories" (
                "item_id" uuid NOT NULL,
                "category_id" uuid NOT NULL,
                CONSTRAINT "PK_product_bundle_item_categories" PRIMARY KEY ("item_id", "category_id"),
                CONSTRAINT "FK_pbic_item" FOREIGN KEY ("item_id") REFERENCES "product_bundle_items"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_pbic_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
            )
        `);

        // Create Junction Table: product_bundle_item_products
        await queryRunner.query(`
            CREATE TABLE "product_bundle_item_products" (
                "item_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                CONSTRAINT "PK_product_bundle_item_products" PRIMARY KEY ("item_id", "product_id"),
                CONSTRAINT "FK_pbip_item" FOREIGN KEY ("item_id") REFERENCES "product_bundle_items"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_pbip_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_bundle_items"`);
        await queryRunner.query(`DROP TYPE "product_bundle_items_mode_enum"`);
        await queryRunner.query(`DROP TABLE "product_bundles"`);
    }

}
