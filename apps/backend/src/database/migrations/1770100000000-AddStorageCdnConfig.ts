import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStorageCdnConfig1770100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "settings" (
        "id",
        "key",
        "value",
        "type",
        "group",
        "is_public",
        "description",
        "created_at",
        "updated_at"
      )
      SELECT
        uuid_generate_v4(),
        'storage.s3.cdn_url',
        '',
        'string',
        'storage',
        false,
        'Base CDN URL used for serving S3 media files',
        NOW(),
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM "settings" WHERE "key" = 'storage.s3.cdn_url'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "settings" WHERE "key" = 'storage.s3.cdn_url';
    `);
  }
}
