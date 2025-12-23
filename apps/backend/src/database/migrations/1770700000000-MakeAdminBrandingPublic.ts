import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAdminBrandingPublic1770700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE settings
      SET is_public = true
      WHERE key IN ('admin.branding.login', 'admin.branding.sidebar')
        AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE settings
      SET is_public = false
      WHERE key IN ('admin.branding.login', 'admin.branding.sidebar')
        AND deleted_at IS NULL;
    `);
  }
}
