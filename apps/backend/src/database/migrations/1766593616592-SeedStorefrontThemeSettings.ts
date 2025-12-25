import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedStorefrontThemeSettings1766593616592 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at") VALUES
            ('storefront.theme.font_family', 'Inter, sans-serif', 'string', 'storefront_appearance', true, 'Storefront font family', NOW(), NOW()),
            ('storefront.theme.primary_color', '#0f172a', 'string', 'storefront_appearance', true, 'Storefront primary color', NOW(), NOW()),
            ('storefront.theme.mode', 'light', 'string', 'storefront_appearance', true, 'Storefront default mode', NOW(), NOW()),
            ('storefront.theme.border_radius', 'md', 'string', 'storefront_appearance', true, 'Storefront border radius', NOW(), NOW());
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "settings" WHERE "key" IN ('storefront.theme.font_family', 'storefront.theme.primary_color', 'storefront.theme.mode', 'storefront.theme.border_radius');
        `);
    }

}
