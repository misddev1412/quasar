import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitialMigration1752024897488 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table (without role column)
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
                    name: 'is_active',
                    type: 'boolean',
                    default: true
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

        // Create roles table
        await queryRunner.createTable(new Table({
            name: 'roles',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'code',
                    type: 'enum',
                    enum: ['super_admin', 'admin', 'manager', 'user', 'guest'],
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
                },
                {
                    name: 'is_default',
                    type: 'boolean',
                    default: false
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

        // Create user_roles table (junction table)
        await queryRunner.createTable(new Table({
            name: 'user_roles',
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
                    name: 'role_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
                },
                {
                    name: 'assigned_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'assigned_by',
                    type: 'uuid',
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
            ],
            foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                },
                {
                    columnNames: ['role_id'],
                    referencedTableName: 'roles',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_USER_ROLES_USER_ID_ROLE_ID',
                    columnNames: ['user_id', 'role_id'],
                    isUnique: true
                }
            ]
        }), true);

        // Create permissions table
        await queryRunner.createTable(new Table({
            name: 'permissions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'resource',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'action',
                    type: 'enum',
                    enum: ['create', 'read', 'update', 'delete', 'execute', 'approve', 'reject', 'publish', 'archive'],
                    isNullable: false
                },
                {
                    name: 'scope',
                    type: 'enum',
                    enum: ['own', 'department', 'organization', 'any'],
                    isNullable: false
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'attributes',
                    type: 'text',
                    isArray: true,
                    default: "'{\"*\"}'"
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
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

        // Create role_permissions table (now references role_id)
        await queryRunner.createTable(new Table({
            name: 'role_permissions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'role_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'permission_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
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
            ],
            foreignKeys: [
                {
                    columnNames: ['role_id'],
                    referencedTableName: 'roles',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                },
                {
                    columnNames: ['permission_id'],
                    referencedTableName: 'permissions',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_ROLE_PERMISSIONS_ROLE_ID_PERMISSION_ID',
                    columnNames: ['role_id', 'permission_id'],
                    isUnique: true
                }
            ]
        }), true);

        // Create user_profiles table
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
                    name: 'user_id',
                    type: 'uuid',
                    isNullable: false
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

        // Create translations table
        await queryRunner.createTable(new Table({
            name: 'translations',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'key',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'locale',
                    type: 'varchar',
                    length: '5',
                    isNullable: false
                },
                {
                    name: 'value',
                    type: 'text',
                    isNullable: false
                },
                {
                    name: 'namespace',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
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
            ],
            indices: [
                {
                    name: 'IDX_TRANSLATION_KEY_LOCALE',
                    columnNames: ['key', 'locale'],
                    isUnique: true
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('translations');
        await queryRunner.dropTable('user_profiles');
        await queryRunner.dropTable('role_permissions');
        await queryRunner.dropTable('permissions');
        await queryRunner.dropTable('user_roles');
        await queryRunner.dropTable('roles');
        await queryRunner.dropTable('users');
    }

}
