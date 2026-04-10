import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStorefrontSectionSpacingSetting1780300000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at")
            SELECT * FROM (VALUES
                ('storefront.theme.section_spacing', '48', 'string', 'storefront_appearance', true::boolean, 'Vertical spacing between storefront sections (px)', NOW(), NOW())
            ) AS v("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at")
            WHERE NOT EXISTS (SELECT 1 FROM "settings" WHERE "settings"."key" = v."key");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "settings" WHERE "key" IN ('storefront.theme.section_spacing');
        `);
    }
}
