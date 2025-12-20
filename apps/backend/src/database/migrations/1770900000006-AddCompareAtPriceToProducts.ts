import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompareAtPriceToProducts1770900000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "compareAtPrice" decimal(10,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "compareAtPrice"
    `);
  }
}
