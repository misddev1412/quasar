import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactPriceFieldsToProductVariants1778700000000 implements MigrationInterface {
    name = 'AddContactPriceFieldsToProductVariants1778700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('product_variants');
        if (!tableExists) return;

        const isContactPriceExists = await queryRunner.hasColumn('product_variants', 'is_contact_price');
        if (!isContactPriceExists) {
            await queryRunner.query(`
        ALTER TABLE "product_variants"
        ADD COLUMN "is_contact_price" boolean DEFAULT false
      `);
        }

        const contactPriceLabelExists = await queryRunner.hasColumn('product_variants', 'contact_price_label');
        if (!contactPriceLabelExists) {
            await queryRunner.query(`
        ALTER TABLE "product_variants"
        ADD COLUMN "contact_price_label" varchar(255) NULL
      `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('product_variants');
        if (!tableExists) return;

        const contactPriceLabelExists = await queryRunner.hasColumn('product_variants', 'contact_price_label');
        if (contactPriceLabelExists) {
            await queryRunner.query(`
        ALTER TABLE "product_variants"
        DROP COLUMN "contact_price_label"
      `);
        }

        const isContactPriceExists = await queryRunner.hasColumn('product_variants', 'is_contact_price');
        if (isContactPriceExists) {
            await queryRunner.query(`
        ALTER TABLE "product_variants"
        DROP COLUMN "is_contact_price"
      `);
        }
    }
}
