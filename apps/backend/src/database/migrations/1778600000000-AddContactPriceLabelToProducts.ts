import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactPriceLabelToProducts1778600000000 implements MigrationInterface {
    name = 'AddContactPriceLabelToProducts1778600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const productsTableExists = await queryRunner.hasTable('products');
        if (!productsTableExists) return;

        const columnExists = await queryRunner.hasColumn('products', 'contact_price_label');
        if (columnExists) return;

        await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "contact_price_label" varchar(255) NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const productsTableExists = await queryRunner.hasTable('products');
        if (!productsTableExists) return;

        const columnExists = await queryRunner.hasColumn('products', 'contact_price_label');
        if (!columnExists) return;

        await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "contact_price_label"
    `);
    }
}
