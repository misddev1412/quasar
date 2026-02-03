import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductCompareAtPriceToSnakeCase1778500000000 implements MigrationInterface {
  name = 'RenameProductCompareAtPriceToSnakeCase1778500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const productsTableExists = await queryRunner.hasTable('products');
    if (!productsTableExists) return;

    const camelCaseExists = await queryRunner.hasColumn('products', 'compareAtPrice');
    if (!camelCaseExists) return;

    await queryRunner.query(`
      ALTER TABLE "products"
      RENAME COLUMN "compareAtPrice" TO "compare_at_price"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const productsTableExists = await queryRunner.hasTable('products');
    if (!productsTableExists) return;

    const snakeCaseExists = await queryRunner.hasColumn('products', 'compare_at_price');
    if (!snakeCaseExists) return;

    await queryRunner.query(`
      ALTER TABLE "products"
      RENAME COLUMN "compare_at_price" TO "compareAtPrice"
    `);
  }
}
