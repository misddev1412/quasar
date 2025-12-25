import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedExtendedThemeSettings1772000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Admin Appearance (group: appearance)
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at")
            SELECT * FROM (VALUES
                ('theme.secondary_color', '#0284c7', 'string', 'appearance', true::boolean, 'Secondary color', NOW(), NOW()),
                ('theme.primary_hover', '#1d4ed8', 'string', 'appearance', true::boolean, 'Primary color hover state', NOW(), NOW()),
                ('theme.primary_light', '#60a5fa', 'string', 'appearance', true::boolean, 'Primary color light variant', NOW(), NOW()),
                ('theme.primary_dark', '#1e40af', 'string', 'appearance', true::boolean, 'Primary color dark variant', NOW(), NOW()),
                ('theme.secondary_hover', '#0369a1', 'string', 'appearance', true::boolean, 'Secondary color hover state', NOW(), NOW()),
                ('theme.secondary_light', '#38bdf8', 'string', 'appearance', true::boolean, 'Secondary color light variant', NOW(), NOW()),
                ('theme.secondary_dark', '#0c4a6e', 'string', 'appearance', true::boolean, 'Secondary color dark variant', NOW(), NOW())
            ) AS v("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at")
            WHERE NOT EXISTS (SELECT 1 FROM "settings" WHERE "settings"."key" = v."key");
        `);

        // Storefront Appearance (group: storefront_appearance)
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at")
            SELECT * FROM (VALUES
                ('storefront.theme.secondary_color', '#0284c7', 'string', 'storefront_appearance', true::boolean, 'Secondary color', NOW(), NOW()),
                ('storefront.theme.primary_hover', '#1d4ed8', 'string', 'storefront_appearance', true::boolean, 'Primary color hover state', NOW(), NOW()),
                ('storefront.theme.primary_light', '#60a5fa', 'string', 'storefront_appearance', true::boolean, 'Primary color light variant', NOW(), NOW()),
                ('storefront.theme.primary_dark', '#1e40af', 'string', 'storefront_appearance', true::boolean, 'Primary color dark variant', NOW(), NOW()),
                ('storefront.theme.secondary_hover', '#0369a1', 'string', 'storefront_appearance', true::boolean, 'Secondary color hover state', NOW(), NOW()),
                ('storefront.theme.secondary_light', '#38bdf8', 'string', 'storefront_appearance', true::boolean, 'Secondary color light variant', NOW(), NOW()),
                ('storefront.theme.secondary_dark', '#0c4a6e', 'string', 'storefront_appearance', true::boolean, 'Secondary color dark variant', NOW(), NOW())
            ) AS v("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at")
            WHERE NOT EXISTS (SELECT 1 FROM "settings" WHERE "settings"."key" = v."key");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Admin
        await queryRunner.query(`
            DELETE FROM "settings" WHERE "key" IN (
                'theme.secondary_color', 
                'theme.primary_hover', 'theme.primary_light', 'theme.primary_dark',
                'theme.secondary_hover', 'theme.secondary_light', 'theme.secondary_dark'
            );
        `);
        // Storefront
        await queryRunner.query(`
            DELETE FROM "settings" WHERE "key" IN (
                'storefront.theme.secondary_color',
                'storefront.theme.primary_hover', 'storefront.theme.primary_light', 'storefront.theme.primary_dark',
                'storefront.theme.secondary_hover', 'storefront.theme.secondary_light', 'storefront.theme.secondary_dark'
            );
        `);
    }

}
