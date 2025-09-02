import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertMediaColumnsToSnakeCase1756400000000 implements MigrationInterface {
  name = 'ConvertMediaColumnsToSnakeCase1756400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing indexes before renaming columns
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_userId_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_userId_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_userId"`);

    // Rename columns from camelCase to snake_case
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "originalName" TO "original_name"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "mimeType" TO "mime_type"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "userId" TO "user_id"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "updatedAt" TO "updated_at"`);

    // Recreate indexes with new column names
    await queryRunner.query(`CREATE INDEX "IDX_media_user_id_type" ON "media" ("user_id", "type")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_user_id_created_at" ON "media" ("user_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_user_id" ON "media" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_user_id_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_user_id_type"`);

    // Rename columns back to camelCase
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "user_id" TO "userId"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "mime_type" TO "mimeType"`);
    await queryRunner.query(`ALTER TABLE "media" RENAME COLUMN "original_name" TO "originalName"`);

    // Recreate original indexes
    await queryRunner.query(`CREATE INDEX "IDX_media_userId" ON "media" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_userId_createdAt" ON "media" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_userId_type" ON "media" ("userId", "type")`);
  }
}