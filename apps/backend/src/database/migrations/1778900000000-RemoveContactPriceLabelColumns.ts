import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveContactPriceLabelColumns1778900000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove from product_variants
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "contact_price_label"`);

        // Remove from products
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "contact_price_label"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add to products
        await queryRunner.query(`ALTER TABLE "products" ADD "contact_price_label" character varying(255)`);

        // Re-add to product_variants
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "contact_price_label" character varying(255)`);
    }
}
