import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateProductVariantItemsTable1762600000000 implements MigrationInterface {
  name = 'CreateProductVariantItemsTable1762600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_variant_items table
    await queryRunner.createTable(
      new Table({
        name: 'product_variant_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'product_variant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'attribute_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'attribute_value_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['product_variant_id'],
            referencedTableName: 'product_variants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['attribute_id'],
            referencedTableName: 'attributes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['attribute_value_id'],
            referencedTableName: 'attribute_values',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Create unique index to ensure one value per attribute per variant
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_product_variant_items_variant_attribute"
      ON "product_variant_items" ("product_variant_id", "attribute_id")
    `);

    // Create index for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_product_variant_items_variant"
      ON "product_variant_items" ("product_variant_id")
    `);

    // Create index for attribute queries
    await queryRunner.query(`
      CREATE INDEX "IDX_product_variant_items_attribute"
      ON "product_variant_items" ("attribute_id")
    `);

    // Create index for attribute value queries
    await queryRunner.query(`
      CREATE INDEX "IDX_product_variant_items_attribute_value"
      ON "product_variant_items" ("attribute_value_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the table (indexes will be dropped automatically)
    await queryRunner.dropTable('product_variant_items');
  }
}