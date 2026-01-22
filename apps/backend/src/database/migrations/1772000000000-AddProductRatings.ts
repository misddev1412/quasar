import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProductRatings1772000000000 implements MigrationInterface {
  name = 'AddProductRatings1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('products');
    if (!table) {
      return;
    }

    if (!table.findColumnByName('average_rating')) {
      await queryRunner.addColumn('products', new TableColumn({
        name: 'average_rating',
        type: 'decimal',
        precision: 3,
        scale: 2,
        isNullable: true,
      }));
    }

    if (!table.findColumnByName('review_count')) {
      await queryRunner.addColumn('products', new TableColumn({
        name: 'review_count',
        type: 'int',
        isNullable: true,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('products');
    if (!table) {
      return;
    }

    if (table.findColumnByName('review_count')) {
      await queryRunner.dropColumn('products', 'review_count');
    }

    if (table.findColumnByName('average_rating')) {
      await queryRunner.dropColumn('products', 'average_rating');
    }
  }
}
