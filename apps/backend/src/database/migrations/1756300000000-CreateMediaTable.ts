import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMediaTable1756300000000 implements MigrationInterface {
  name = 'CreateMediaTable1756300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create media table
    await queryRunner.createTable(
      new Table({
        name: 'media',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'originalName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'url',
            type: 'text',
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['image', 'video', 'audio', 'document', 'other'],
          },
          {
            name: 'size',
            type: 'bigint',
          },
          {
            name: 'folder',
            type: 'varchar',
            length: '100',
            default: "'general'",
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            default: "'local'",
          },
          {
            name: 'alt',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'caption',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('media', new TableIndex({
      name: 'IDX_media_userId_type',
      columnNames: ['userId', 'type'],
    }));

    await queryRunner.createIndex('media', new TableIndex({
      name: 'IDX_media_userId_createdAt',
      columnNames: ['userId', 'createdAt'],
    }));

    await queryRunner.createIndex('media', new TableIndex({
      name: 'IDX_media_userId',
      columnNames: ['userId'],
    }));

    // Create foreign key constraint
    await queryRunner.createForeignKey('media', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
      name: 'FK_media_userId',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('media', 'FK_media_userId');

    // Drop indexes
    await queryRunner.dropIndex('media', 'IDX_media_userId');
    await queryRunner.dropIndex('media', 'IDX_media_userId_createdAt');
    await queryRunner.dropIndex('media', 'IDX_media_userId_type');

    // Drop table
    await queryRunner.dropTable('media');
  }
}