import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMediaRelationsTable1779100000000 implements MigrationInterface {
    name = 'CreateMediaRelationsTable1779100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'media_relations',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'media_id',
                        type: 'uuid',
                    },
                    {
                        name: 'object_id',
                        type: 'uuid',
                    },
                    {
                        name: 'object_type',
                        type: 'varchar',
                        length: '50',
                    },
                    {
                        name: 'field_name',
                        type: 'varchar',
                        length: '50',
                    },
                    {
                        name: 'order',
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
                    {
                        name: 'version',
                        type: 'int',
                        default: 1,
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'updated_by',
                        type: 'uuid',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create indices
        await queryRunner.createIndex(
            'media_relations',
            new TableIndex({
                name: 'IDX_media_relations_object_id_object_type',
                columnNames: ['object_id', 'object_type'],
            }),
        );

        await queryRunner.createIndex(
            'media_relations',
            new TableIndex({
                name: 'IDX_media_relations_object_lookup',
                columnNames: ['object_id', 'object_type', 'field_name'],
            }),
        );

        // Create foreign key constraint
        await queryRunner.createForeignKey(
            'media_relations',
            new TableForeignKey({
                columnNames: ['media_id'],
                referencedTableName: 'media',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'FK_media_relations_media_id',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('media_relations', 'FK_media_relations_media_id');
        await queryRunner.dropIndex('media_relations', 'IDX_media_relations_object_lookup');
        await queryRunner.dropIndex('media_relations', 'IDX_media_relations_object_id_object_type');
        await queryRunner.dropTable('media_relations');
    }
}
