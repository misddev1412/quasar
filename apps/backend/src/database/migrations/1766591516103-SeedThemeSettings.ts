import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedThemeSettings1766591516103 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at") VALUES
            ('theme.font_family', 'Inter, sans-serif', 'string', 'appearance', true, 'Global font family for the application', NOW(), NOW()),
            ('theme.primary_color', '#2563eb', 'string', 'appearance', true, 'Primary color for the application theme', NOW(), NOW()),
            ('theme.mode', 'light', 'string', 'appearance', true, 'Default theme mode (light/dark)', NOW(), NOW()),
            ('theme.border_radius', 'md', 'string', 'appearance', true, 'Global border radius (none, sm, md, lg, xl)', NOW(), NOW());
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "settings" WHERE "key" IN ('theme.font_family', 'theme.primary_color', 'theme.mode', 'theme.border_radius');
        `);
    }

}
