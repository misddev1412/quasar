import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingBaseEntityColumnsToProductTagsTable1757782508569 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if version column exists before adding
        const versionExists = await queryRunner.hasColumn("product_tags", "version");
        if (!versionExists) {
            await queryRunner.query(`
                ALTER TABLE "product_tags"
                ADD COLUMN "version" integer NOT NULL DEFAULT 1
            `);
        }

        // Check if created_by column exists before adding
        const createdByExists = await queryRunner.hasColumn("product_tags", "created_by");
        if (!createdByExists) {
            await queryRunner.query(`
                ALTER TABLE "product_tags"
                ADD COLUMN "created_by" uuid
            `);
        }

        // Check if updated_by column exists before adding
        const updatedByExists = await queryRunner.hasColumn("product_tags", "updated_by");
        if (!updatedByExists) {
            await queryRunner.query(`
                ALTER TABLE "product_tags"
                ADD COLUMN "updated_by" uuid
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop columns in reverse order, only if they exist
        const updatedByExists = await queryRunner.hasColumn("product_tags", "updated_by");
        if (updatedByExists) {
            await queryRunner.query(`
                ALTER TABLE "product_tags"
                DROP COLUMN "updated_by"
            `);
        }

        const createdByExists = await queryRunner.hasColumn("product_tags", "created_by");
        if (createdByExists) {
            await queryRunner.query(`
                ALTER TABLE "product_tags"
                DROP COLUMN "created_by"
            `);
        }

        const versionExists = await queryRunner.hasColumn("product_tags", "version");
        if (versionExists) {
            await queryRunner.query(`
                ALTER TABLE "product_tags"
                DROP COLUMN "version"
            `);
        }
    }

}
