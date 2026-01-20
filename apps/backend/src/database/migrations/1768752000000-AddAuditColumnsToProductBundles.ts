import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditColumnsToProductBundles1768752000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns to product_bundles
        await queryRunner.query(`ALTER TABLE "product_bundles" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "product_bundles" ADD "updated_by" uuid`);

        // Add columns to product_bundle_items
        await queryRunner.query(`ALTER TABLE "product_bundle_items" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "product_bundle_items" ADD "updated_by" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from product_bundle_items
        await queryRunner.query(`ALTER TABLE "product_bundle_items" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "product_bundle_items" DROP COLUMN "created_by"`);

        // Remove columns from product_bundles
        await queryRunner.query(`ALTER TABLE "product_bundles" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "product_bundles" DROP COLUMN "created_by"`);
    }

}
