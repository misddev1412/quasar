import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedProductBundlePermissions1768750972921 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissions = [
            {
                name: 'read:any:product_bundle',
                resource: 'product_bundle',
                action: 'read',
                scope: 'any',
                description: 'Access to routes: /product-bundles'
            },
            {
                name: 'create:any:product_bundle',
                resource: 'product_bundle',
                action: 'create',
                scope: 'any',
                description: 'Access to routes: /product-bundles/create'
            },
            {
                name: 'update:any:product_bundle',
                resource: 'product_bundle',
                action: 'update',
                scope: 'any',
                description: 'Access to routes: /product-bundles/:id/edit'
            },
            {
                name: 'delete:any:product_bundle',
                resource: 'product_bundle',
                action: 'delete',
                scope: 'any',
                description: 'Ability to delete product bundles'
            }
        ];

        for (const p of permissions) {
            await queryRunner.query(
                `INSERT INTO "permissions" ("name", "resource", "action", "scope", "description", "attributes", "is_active", "created_at", "updated_at")
                 VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
                 ON CONFLICT ("name") DO NOTHING`,
                [p.name, p.resource, p.action, p.scope, p.description, '{"*"}']
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "permissions" WHERE "resource" = 'product_bundle'`);
    }
}
