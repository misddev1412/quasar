import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProductMediaTable1757754405356 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create media_type enum if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "media_type_enum" AS ENUM ('image', 'video', 'audio', 'document', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create product_media table
    await queryRunner.createTable(
      new Table({
        name: 'product_media',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'media_type_enum',
            isNullable: false,
            default: "'image'",
          },
          {
            name: 'url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'alt_text',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'caption',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: true,
            comment: 'File size in bytes',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'width',
            type: 'int',
            isNullable: true,
            comment: 'Width in pixels for images/videos',
          },
          {
            name: 'height',
            type: 'int',
            isNullable: true,
            comment: 'Height in pixels for images/videos',
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: true,
            comment: 'Duration in seconds for videos/audio',
          },
          {
            name: 'thumbnail_url',
            type: 'text',
            isNullable: true,
            comment: 'Thumbnail URL for videos',
          },
          {
            name: 'is_primary',
            type: 'boolean',
            isNullable: false,
            default: false,
            comment: 'Whether this is the primary media for the product',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('product_media', new TableIndex({
      name: 'IDX_product_media_product_id',
      columnNames: ['product_id']
    }));

    await queryRunner.createIndex('product_media', new TableIndex({
      name: 'IDX_product_media_type',
      columnNames: ['type']
    }));

    await queryRunner.createIndex('product_media', new TableIndex({
      name: 'IDX_product_media_sort_order',
      columnNames: ['product_id', 'sort_order']
    }));

    await queryRunner.createIndex('product_media', new TableIndex({
      name: 'IDX_product_media_is_primary',
      columnNames: ['product_id', 'is_primary']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('product_media', 'IDX_product_media_is_primary');
    await queryRunner.dropIndex('product_media', 'IDX_product_media_sort_order');
    await queryRunner.dropIndex('product_media', 'IDX_product_media_type');
    await queryRunner.dropIndex('product_media', 'IDX_product_media_product_id');

    // Drop table
    await queryRunner.dropTable('product_media');

    // Drop enum
    await queryRunner.query(`DROP TYPE "media_type_enum"`);
  }
}