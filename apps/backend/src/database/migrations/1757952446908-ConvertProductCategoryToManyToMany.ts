import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertProductCategoryToManyToMany1757952446908 implements MigrationInterface {
    name = 'ConvertProductCategoryToManyToMany1757952446908';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create product_categories pivot table with BaseEntity structure
        await queryRunner.query(`
            CREATE TABLE "product_categories" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "product_id" uuid NOT NULL,
                "category_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "version" integer NOT NULL DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "PK_product_categories" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_product_categories_product_category" UNIQUE ("product_id", "category_id"),
                CONSTRAINT "FK_product_categories_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_product_categories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_product_categories_product_id" ON "product_categories" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_categories_category_id" ON "product_categories" ("category_id")`);

        // Check if categoryId column exists before dropping constraints and column
        const columnExists = await queryRunner.hasColumn('products', 'categoryId');

        if (columnExists) {
            // Drop foreign key constraint if it exists
            await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_category"`);

            // Drop the index if it exists
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_category"`);

            // Remove categoryId column from products table
            await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryId"`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add categoryId column back to products table
        await queryRunner.query(`ALTER TABLE "products" ADD "categoryId" uuid`);

        // Recreate foreign key constraint
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL`);

        // Recreate index
        await queryRunner.query(`CREATE INDEX "IDX_products_category" ON "products" ("categoryId")`);

        // Drop product_categories table
        await queryRunner.query(`DROP TABLE "product_categories"`);
    }

}
