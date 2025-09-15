import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionColumnToProductVariantItemsTable1757845780506 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add version column
        await queryRunner.query(`
            ALTER TABLE "product_variant_items"
            ADD COLUMN "version" integer NOT NULL DEFAULT 1
        `);

        // Add created_by column
        await queryRunner.query(`
            ALTER TABLE "product_variant_items"
            ADD COLUMN "created_by" uuid
        `);

        // Add updated_by column
        await queryRunner.query(`
            ALTER TABLE "product_variant_items"
            ADD COLUMN "updated_by" uuid
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_variant_items"
            DROP COLUMN "updated_by"
        `);

        await queryRunner.query(`
            ALTER TABLE "product_variant_items"
            DROP COLUMN "created_by"
        `);

        await queryRunner.query(`
            ALTER TABLE "product_variant_items"
            DROP COLUMN "version"
        `);
    }

}
