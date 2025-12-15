import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddSeoAndTocColumnsToPosts1770200000000 implements MigrationInterface {
  private readonly tableName = 'posts';
  private readonly featuredIndex = new TableIndex({
    name: 'IDX_POSTS_IS_FEATURED',
    columnNames: ['is_featured'],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, [
      new TableColumn({
        name: 'canonical_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
      new TableColumn({
        name: 'meta_robots',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'social_metadata',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'structured_data',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'image_gallery',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'content_table_of_contents',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'category_table_of_contents',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'additional_meta',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'seo_score',
        type: 'int',
        default: 0,
      }),
      new TableColumn({
        name: 'reading_time_minutes',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(this.tableName, this.featuredIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.tableName, this.featuredIndex);

    await queryRunner.dropColumns(this.tableName, [
      'reading_time_minutes',
      'seo_score',
      'additional_meta',
      'category_table_of_contents',
      'content_table_of_contents',
      'image_gallery',
      'structured_data',
      'social_metadata',
      'meta_robots',
      'canonical_url',
    ]);
  }
}
