import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserSecurityTable1759039412000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'user_security',
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
                    name: 'two_factor_enabled',
                    type: 'boolean',
                    default: false
                },
                {
                    name: 'two_factor_method',
                    type: 'enum',
                    enum: ['email', 'authenticator', 'sms'],
                    isNullable: true
                },
                {
                    name: 'two_factor_secret',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'two_factor_backup_codes',
                    type: 'text',
                    isArray: true,
                    isNullable: true
                },
                {
                    name: 'last_password_change',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'failed_login_attempts',
                    type: 'int',
                    default: 0
                },
                {
                    name: 'account_locked_until',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'security_questions',
                    type: 'json',
                    isNullable: true
                },
                {
                    name: 'last_security_audit',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_USER_SECURITY_USER_ID',
                    columnNames: ['user_id'],
                    isUnique: true
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_security');
    }

}