import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class SeedManagerAndStaffRoles1779200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Ensure Roles Exist
        const roles = [
            {
                name: 'Manager',
                code: 'manager',
                description: 'Manager with operational access',
                isActive: true,
                isDefault: false,
            },
            {
                name: 'Staff',
                code: 'staff',
                description: 'Staff member with limited operational access',
                isActive: true,
                isDefault: false,
            },
        ];

        for (const role of roles) {
            const existingRole = await queryRunner.query(
                `SELECT * FROM "roles" WHERE code = '${role.code}'`
            );

            if (existingRole.length === 0) {
                await queryRunner.query(
                    `INSERT INTO "roles" (id, name, code, description, "is_active", "is_default", "created_at", "updated_at") VALUES ('${uuidv4()}', '${role.name}', '${role.code}', '${role.description}', ${role.isActive}, ${role.isDefault}, NOW(), NOW())`
                );
            }
        }

        // 2. Grant Permissions
        // Fetch Role IDs
        const managerRole = (await queryRunner.query(`SELECT id FROM "roles" WHERE code = 'manager'`))[0];
        const staffRole = (await queryRunner.query(`SELECT id FROM "roles" WHERE code = 'staff'`))[0];

        // Define minimal permissions to check (format: action:scope:resource)
        const permissionsToCheck = ['read:any:dashboard', 'read:any:order'];

        for (const permName of permissionsToCheck) {
            // Check if permission exists, if not create
            let perm = (await queryRunner.query(`SELECT id FROM "permissions" WHERE name = '${permName}'`))[0];

            if (!perm) {
                const [action, scope, resource] = permName.split(':');
                const newPermId = uuidv4();
                await queryRunner.query(
                    `INSERT INTO "permissions" (id, name, resource, action, scope, "created_at", "updated_at") VALUES ('${newPermId}', '${permName}', '${resource}', '${action}', '${scope}', NOW(), NOW())`
                );
                perm = { id: newPermId };
            }

            // Assign to Manager
            if (managerRole) {
                const exists = (await queryRunner.query(`SELECT * FROM "role_permissions" WHERE "role_id" = '${managerRole.id}' AND "permission_id" = '${perm.id}'`)).length > 0;
                if (!exists) {
                    await queryRunner.query(`INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ('${managerRole.id}', '${perm.id}')`);
                }
            }

            // Assign to Staff
            if (staffRole) {
                const exists = (await queryRunner.query(`SELECT * FROM "role_permissions" WHERE "role_id" = '${staffRole.id}' AND "permission_id" = '${perm.id}'`)).length > 0;
                if (!exists) {
                    await queryRunner.query(`INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ('${staffRole.id}', '${perm.id}')`);
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We typically don't remove roles in down migration to avoid data loss on existing users
    }
}
