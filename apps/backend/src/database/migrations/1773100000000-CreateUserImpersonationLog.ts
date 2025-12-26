import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateUserImpersonationLog1773100000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_impersonation_logs table
        await queryRunner.createTable(new Table({
            name: 'user_impersonation_logs',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'admin_user_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'impersonated_user_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'started_at',
                    type: 'timestamp',
                    isNullable: false,
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'ended_at',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'ip_address',
                    type: 'varchar',
                    length: '45', // IPv6 support
                    isNullable: true
                },
                {
                    name: 'user_agent',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'reason',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'session_token',
                    type: 'varchar',
                    length: '500',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['active', 'ended', 'expired'],
                    default: "'active'"
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ]
        }), true);

        // Create indexes for user_impersonation_logs
        await queryRunner.createIndex('user_impersonation_logs', new TableIndex({
            name: 'IDX_user_impersonation_logs_admin_user_id',
            columnNames: ['admin_user_id']
        }));

        await queryRunner.createIndex('user_impersonation_logs', new TableIndex({
            name: 'IDX_user_impersonation_logs_impersonated_user_id',
            columnNames: ['impersonated_user_id']
        }));

        await queryRunner.createIndex('user_impersonation_logs', new TableIndex({
            name: 'IDX_user_impersonation_logs_status',
            columnNames: ['status']
        }));

        await queryRunner.createIndex('user_impersonation_logs', new TableIndex({
            name: 'IDX_user_impersonation_logs_started_at',
            columnNames: ['started_at']
        }));

        // Create foreign key constraints
        await queryRunner.createForeignKey('user_impersonation_logs', new TableForeignKey({
            columnNames: ['admin_user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));

        await queryRunner.createForeignKey('user_impersonation_logs', new TableForeignKey({
            columnNames: ['impersonated_user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const impersonationLogsTable = await queryRunner.getTable('user_impersonation_logs');

        if (impersonationLogsTable) {
            const adminForeignKey = impersonationLogsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf('admin_user_id') !== -1
            );
            if (adminForeignKey) {
                await queryRunner.dropForeignKey('user_impersonation_logs', adminForeignKey);
            }

            const impersonatedForeignKey = impersonationLogsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf('impersonated_user_id') !== -1
            );
            if (impersonatedForeignKey) {
                await queryRunner.dropForeignKey('user_impersonation_logs', impersonatedForeignKey);
            }
        }

        // Drop table
        await queryRunner.dropTable('user_impersonation_logs');
    }
}
