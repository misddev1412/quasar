import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveAdminBrandingToSettings1770300000000 implements MigrationInterface {
  private readonly loginDefault = JSON.stringify({
    logoUrl: '/assets/images/logo.png',
    logoText: 'Q',
    showLogoText: true,
    width: 48,
    height: 48,
  });

  private readonly sidebarDefault = JSON.stringify({
    logoUrl: '/assets/images/logo.png',
    logoText: 'Q',
    brandName: 'Quasar',
    subtitle: 'Admin Dashboard',
    showLogoText: true,
    width: 36,
    height: 36,
  });

  private readonly loginSchema = JSON.stringify({
    logoUrl: { type: 'string', description: 'URL or path to the logo image' },
    logoText: { type: 'string', description: 'Text to display if no logo image' },
    showLogoText: { type: 'boolean', description: 'Show logo text when image is available' },
    width: { type: 'number', description: 'Logo width in pixels' },
    height: { type: 'number', description: 'Logo height in pixels' },
  });

  private readonly sidebarSchema = JSON.stringify({
    logoUrl: { type: 'string', description: 'URL or path to the logo image' },
    logoText: { type: 'string', description: 'Text to display if no logo image' },
    brandName: { type: 'string', description: 'Brand name to display next to logo' },
    subtitle: { type: 'string', description: 'Subtitle text below brand name' },
    showLogoText: { type: 'boolean', description: 'Show logo text when image is available' },
    width: { type: 'number', description: 'Logo width in pixels' },
    height: { type: 'number', description: 'Logo height in pixels' },
  });

  private readonly loginMetadata = JSON.stringify({
    componentPath: 'apps/admin/src/components/auth/AuthCard.tsx',
    usedIn: ['LoginPage'],
  });

  private readonly sidebarMetadata = JSON.stringify({
    componentPath: 'apps/admin/src/components/layout/Logo.tsx',
    usedIn: ['Sidebar'],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO settings (id, "key", value, type, "group", is_public, description, created_at, updated_at)
      SELECT gen_random_uuid(),
             'admin.branding.login',
             COALESCE((SELECT default_config::text FROM component_configs WHERE component_key = 'admin_login_logo' AND deleted_at IS NULL LIMIT 1), $1),
             'json',
             'admin-branding',
             false,
             'Branding configuration for the admin login experience',
             NOW(),
             NOW()
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'admin.branding.login');
      `,
      [this.loginDefault],
    );

    await queryRunner.query(
      `
      INSERT INTO settings (id, "key", value, type, "group", is_public, description, created_at, updated_at)
      SELECT gen_random_uuid(),
             'admin.branding.sidebar',
             COALESCE((SELECT default_config::text FROM component_configs WHERE component_key = 'admin_sidebar_logo' AND deleted_at IS NULL LIMIT 1), $1),
             'json',
             'admin-branding',
             false,
             'Branding configuration for the admin sidebar and shell',
             NOW(),
             NOW()
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'admin.branding.sidebar');
      `,
      [this.sidebarDefault],
    );

    await queryRunner.query(`
      DELETE FROM component_configs
      WHERE component_key IN ('admin_login_logo', 'admin_sidebar_logo');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO component_configs (
        id,
        component_key,
        display_name,
        description,
        component_type,
        category,
        position,
        is_enabled,
        default_config,
        config_schema,
        metadata,
        allowed_child_keys,
        preview_media_url,
        parent_id,
        slot_key,
        created_at,
        updated_at,
        version
      )
      SELECT gen_random_uuid(),
             'admin_login_logo',
             'Admin Login Logo',
             'Logo displayed on the admin login page',
             'atomic'::component_structure_type_enum,
             'content'::component_category_enum,
             0,
             true,
             COALESCE((SELECT value::jsonb FROM settings WHERE key = 'admin.branding.login' AND deleted_at IS NULL LIMIT 1), $1::jsonb),
             $2::jsonb,
             $3::jsonb,
             '[]'::jsonb,
             NULL,
             NULL,
             NULL,
             NOW(),
             NOW(),
             1
      WHERE NOT EXISTS (SELECT 1 FROM component_configs WHERE component_key = 'admin_login_logo');
      `,
      [this.loginDefault, this.loginSchema, this.loginMetadata],
    );

    await queryRunner.query(
      `
      INSERT INTO component_configs (
        id,
        component_key,
        display_name,
        description,
        component_type,
        category,
        position,
        is_enabled,
        default_config,
        config_schema,
        metadata,
        allowed_child_keys,
        preview_media_url,
        parent_id,
        slot_key,
        created_at,
        updated_at,
        version
      )
      SELECT gen_random_uuid(),
             'admin_sidebar_logo',
             'Admin Sidebar Logo',
             'Logo displayed in the admin sidebar',
             'atomic'::component_structure_type_enum,
             'content'::component_category_enum,
             1,
             true,
             COALESCE((SELECT value::jsonb FROM settings WHERE key = 'admin.branding.sidebar' AND deleted_at IS NULL LIMIT 1), $1::jsonb),
             $2::jsonb,
             $3::jsonb,
             '[]'::jsonb,
             NULL,
             NULL,
             NULL,
             NOW(),
             NOW(),
             1
      WHERE NOT EXISTS (SELECT 1 FROM component_configs WHERE component_key = 'admin_sidebar_logo');
      `,
      [this.sidebarDefault, this.sidebarSchema, this.sidebarMetadata],
    );

    await queryRunner.query(`
      DELETE FROM settings WHERE key IN ('admin.branding.login', 'admin.branding.sidebar');
    `);
  }
}
