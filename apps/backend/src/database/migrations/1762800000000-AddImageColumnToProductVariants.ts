import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageColumnToProductVariants1762800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the image column already exists
        const table = await queryRunner.getTable('product_variants');
        const imageColumn = table?.findColumnByName('image');

        if (!imageColumn) {
            // Add the image column if it doesn't exist
            await queryRunner.query(`
                ALTER TABLE "product_variants"
                ADD COLUMN "image" character varying(500)
            `);

            // Add index for better performance when querying by image
            await queryRunner.query(`
                CREATE INDEX IF NOT EXISTS "IDX_product_variants_image" ON "product_variants" ("image")
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index first
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_variants_image"`);

        // Drop the image column
        await queryRunner.query(`
            ALTER TABLE "product_variants"
            DROP COLUMN IF EXISTS "image"
        `);
    }
}