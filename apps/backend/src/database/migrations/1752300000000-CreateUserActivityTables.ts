import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from "typeorm";

export class CreateUserActivityTables1752300000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_activities table
        await queryRunner.createTable(new Table({
            name: 'user_activities',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'user_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'session_id',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'activity_type',
                    type: 'enum',
                    enum: [
                        'login', 'logout', 'page_view', 'api_call', 'profile_update',
                        'password_change', 'settings_update', 'file_upload', 'file_download',
                        'search', 'create', 'update', 'delete', 'view', 'export', 'import',
                        'admin_action', 'other'
                    ],
                    isNullable: false
                },
                {
                    name: 'activity_description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'resource_type',
                    type: 'varchar',
                    length: '100',
                    isNullable: true
                },
                {
                    name: 'resource_id',
                    type: 'varchar',
                    length: '255',
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
                    name: 'request_path',
                    type: 'varchar',
                    length: '500',
                    isNullable: true
                },
                {
                    name: 'request_method',
                    type: 'varchar',
                    length: '10',
                    isNullable: true
                },
                {
                    name: 'response_status',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'duration_ms',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'metadata',
                    type: 'jsonb',
                    isNullable: true
                },
                {
                    name: 'is_successful',
                    type: 'boolean',
                    default: true
                },
                {
                    name: 'error_message',
                    type: 'text',
                    isNullable: true
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

        // Create user_sessions table
        await queryRunner.createTable(new Table({
            name: 'user_sessions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'user_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'session_token',
                    type: 'varchar',
                    length: '500',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'refresh_token',
                    type: 'varchar',
                    length: '500',
                    isUnique: true,
                    isNullable: true
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['active', 'expired', 'terminated', 'logged_out'],
                    default: "'active'"
                },
                {
                    name: 'ip_address',
                    type: 'varchar',
                    length: '45',
                    isNullable: true
                },
                {
                    name: 'user_agent',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'device_type',
                    type: 'varchar',
                    length: '50',
                    isNullable: true
                },
                {
                    name: 'browser',
                    type: 'varchar',
                    length: '100',
                    isNullable: true
                },
                {
                    name: 'operating_system',
                    type: 'varchar',
                    length: '100',
                    isNullable: true
                },
                {
                    name: 'location',
                    type: 'varchar',
                    length: '200',
                    isNullable: true
                },
                {
                    name: 'login_at',
                    type: 'timestamp',
                    isNullable: false
                },
                {
                    name: 'last_activity_at',
                    type: 'timestamp',
                    isNullable: false
                },
                {
                    name: 'logout_at',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'expires_at',
                    type: 'timestamp',
                    isNullable: false
                },
                {
                    name: 'is_remember_me',
                    type: 'boolean',
                    default: false
                },
                {
                    name: 'session_data',
                    type: 'jsonb',
                    isNullable: true
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

        // Create indexes for user_activities
        await queryRunner.createIndex('user_activities', new Index('IDX_user_activities_user_id_activity_type', ['user_id', 'activity_type']));
        await queryRunner.createIndex('user_activities', new Index('IDX_user_activities_user_id_created_at', ['user_id', 'created_at']));
        await queryRunner.createIndex('user_activities', new Index('IDX_user_activities_activity_type_created_at', ['activity_type', 'created_at']));
        await queryRunner.createIndex('user_activities', new Index('IDX_user_activities_session_id', ['session_id']));

        // Create indexes for user_sessions
        await queryRunner.createIndex('user_sessions', new Index('IDX_user_sessions_user_id_status', ['user_id', 'status']));
        await queryRunner.createIndex('user_sessions', new Index('IDX_user_sessions_user_id_created_at', ['user_id', 'created_at']));
        await queryRunner.createIndex('user_sessions', new Index('IDX_user_sessions_expires_at', ['expires_at']));

        // Create foreign key constraints
        await queryRunner.createForeignKey('user_activities', new ForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));

        await queryRunner.createForeignKey('user_sessions', new ForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const userActivitiesTable = await queryRunner.getTable('user_activities');
        const userSessionsTable = await queryRunner.getTable('user_sessions');
        
        if (userActivitiesTable) {
            const userActivitiesForeignKey = userActivitiesTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
            if (userActivitiesForeignKey) {
                await queryRunner.dropForeignKey('user_activities', userActivitiesForeignKey);
            }
        }

        if (userSessionsTable) {
            const userSessionsForeignKey = userSessionsTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
            if (userSessionsForeignKey) {
                await queryRunner.dropForeignKey('user_sessions', userSessionsForeignKey);
            }
        }

        // Drop tables
        await queryRunner.dropTable('user_activities');
        await queryRunner.dropTable('user_sessions');
    }
}
