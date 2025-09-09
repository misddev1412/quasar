import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFirebaseConfigsTable1757000000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'firebase_configs',
        columns: [
          // BaseEntity columns
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
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
            type: 'integer',
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
          // SoftDeletableEntity columns
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
          // Firebase-specific columns
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'api_key',
            type: 'text',
          },
          {
            name: 'auth_domain',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'project_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'storage_bucket',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'messaging_sender_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'app_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'measurement_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'service_account_key',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create unique index on name
    await queryRunner.createIndex(
      'firebase_configs',
      new TableIndex({
        name: 'IDX_FIREBASE_CONFIG_NAME',
        columnNames: ['name'],
        isUnique: true,
      })
    );

    // Create index on is_active for finding active configs
    await queryRunner.createIndex(
      'firebase_configs',
      new TableIndex({
        name: 'IDX_FIREBASE_CONFIG_ACTIVE',
        columnNames: ['is_active'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('firebase_configs', 'IDX_FIREBASE_CONFIG_ACTIVE');
    await queryRunner.dropIndex('firebase_configs', 'IDX_FIREBASE_CONFIG_NAME');
    
    // Drop table
    await queryRunner.dropTable('firebase_configs');
  }
}