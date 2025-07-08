import { MigrationInterface, QueryRunner, Table, Index } from "typeorm";

export class CreatePermissionTables1751947054398 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                    enum: ['create', 'read', 'update', 'delete'],
                    isNullable: false
                },
                {
                    name: 'scope',
                    type: 'enum',
                    enum: ['own', 'any'],
                    isNullable: false
                },
                {
                    name: 'description',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'attributes',
                    type: 'text',
                    isArray: true,
                    default: "ARRAY['*']"
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

        // Create role_permissions table (junction table)
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
                    name: 'role',
                    type: 'enum',
                    enum: ['super_admin', 'admin', 'user'],
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
                    columnNames: ['permission_id'],
                    referencedTableName: 'permissions',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ]
        }), true);

        // Create unique index on role and permission_id
        await queryRunner.query('CREATE UNIQUE INDEX "IDX_role_permission" ON "role_permissions" ("role", "permission_id")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('role_permissions', 'IDX_role_permission');
        await queryRunner.dropTable('role_permissions');
        await queryRunner.dropTable('permissions');
    }

} 