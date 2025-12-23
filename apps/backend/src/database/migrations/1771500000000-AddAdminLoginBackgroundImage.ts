import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminLoginBackgroundImage1771500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE settings
      SET value = jsonb_set(
        COALESCE(value::jsonb, '{}'::jsonb),
        '{backgroundImageUrl}',
        'null'::jsonb,
        true
      )::text
      WHERE "key" = 'admin.branding.login'
        AND NOT ((COALESCE(value::jsonb, '{}'::jsonb)) ? 'backgroundImageUrl');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE settings
      SET value = (COALESCE(value::jsonb, '{}'::jsonb) - 'backgroundImageUrl')::text
      WHERE "key" = 'admin.branding.login';
    `);
  }
}
