import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductPriceHistoryTables1771600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create product_price_history table
        await queryRunner.createTable(
            new Table({
                name: 'product_price_history',
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
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'compare_at_price',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'is_contact_price',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'product_price_history',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            }),
        );

        // Create product_variant_price_history table
        await queryRunner.createTable(
            new Table({
                name: 'product_variant_price_history',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'variant_id',
                        type: 'uuid',
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'compare_at_price',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'product_variant_price_history',
            new TableForeignKey({
                columnNames: ['variant_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'product_variants',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const variantTable = await queryRunner.getTable('product_variant_price_history');
        if (variantTable) {
            const foreignKey = variantTable.foreignKeys.find(fk => fk.columnNames.indexOf('variant_id') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('product_variant_price_history', foreignKey);
            }
        }
        await queryRunner.dropTable('product_variant_price_history');

        const productTable = await queryRunner.getTable('product_price_history');
        if (productTable) {
            const foreignKey = productTable.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('product_price_history', foreignKey);
            }
        }
        await queryRunner.dropTable('product_price_history');
    }
}
