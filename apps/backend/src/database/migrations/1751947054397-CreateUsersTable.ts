import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1751947054397 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table (authentication data)
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'username',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'password',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['super_admin', 'admin', 'user'],
                    default: "'user'"
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP'
                }
            ]
        }), true);

        // Create user_profiles table (profile data)
        await queryRunner.createTable(new Table({
            name: 'user_profiles',
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
                    name: 'first_name',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'phone_number',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'date_of_birth',
                    type: 'date',
                    isNullable: true
                },
                {
                    name: 'avatar',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'bio',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'address',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'city',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'country',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'postal_code',
                    type: 'varchar',
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
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP'
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_profiles');
        await queryRunner.dropTable('users');
    }

}
