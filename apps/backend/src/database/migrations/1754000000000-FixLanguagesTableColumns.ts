import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixLanguagesTableColumns1754000000000 implements MigrationInterface {
  name = 'FixLanguagesTableColumns1754000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if languages table exists, if not create it with correct column names
    const table = await queryRunner.hasTable('languages');
    
    if (!table) {
      // Create the languages table with correct column names
      await queryRunner.query(`
        CREATE TABLE "languages" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "code" varchar(10) NOT NULL UNIQUE,
          "name" varchar(100) NOT NULL,
          "native_name" varchar(100) NOT NULL,
          "icon" varchar(10),
          "is_active" boolean NOT NULL DEFAULT true,
          "is_default" boolean NOT NULL DEFAULT false,
          "sort_order" int NOT NULL DEFAULT 0,
          "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "deleted_at" timestamp,
          "version" int NOT NULL DEFAULT 1,
          "created_by" uuid,
          "updated_by" uuid,
          "deleted_by" uuid,
          CONSTRAINT "PK_languages" PRIMARY KEY ("id")
        )
      `);

      // Create indexes
      await queryRunner.query(`CREATE UNIQUE INDEX "IDX_LANGUAGE_CODE" ON "languages" ("code")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_ACTIVE" ON "languages" ("is_active")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_DEFAULT" ON "languages" ("is_default")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_SORT_ORDER" ON "languages" ("sort_order")`);

      // Insert initial language data
      await queryRunner.query(`
        INSERT INTO "languages" ("code", "name", "native_name", "icon", "is_active", "is_default", "sort_order") VALUES
        ('en', 'English', 'English', '🇺🇸', true, true, 1),
        ('vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳', true, false, 2),
        ('fr', 'French', 'Français', '🇫🇷', false, false, 3),
        ('de', 'German', 'Deutsch', '🇩🇪', false, false, 4),
        ('es', 'Spanish', 'Español', '🇪🇸', false, false, 5),
        ('it', 'Italian', 'Italiano', '🇮🇹', false, false, 6),
        ('pt', 'Portuguese', 'Português', '🇵🇹', false, false, 7),
        ('ja', 'Japanese', '日本語', '🇯🇵', false, false, 8),
        ('ko', 'Korean', '한국어', '🇰🇷', false, false, 9),
        ('zh', 'Chinese', '中文', '🇨🇳', false, false, 10),
        ('ru', 'Russian', 'Русский', '🇷🇺', false, false, 11),
        ('ar', 'Arabic', 'العربية', '🇸🇦', false, false, 12),
        ('hi', 'Hindi', 'हिन्दी', '🇮🇳', false, false, 13),
        ('th', 'Thai', 'ไทย', '🇹🇭', false, false, 14),
        ('id', 'Indonesian', 'Bahasa Indonesia', '🇮🇩', false, false, 15)
      `);
    } else {
      // If table exists but has wrong column names, fix them
      const hasCreatedAt = await queryRunner.hasColumn('languages', 'created_at');
      const hasCamelCreatedAt = await queryRunner.hasColumn('languages', 'createdAt');
      
      if (!hasCreatedAt && hasCamelCreatedAt) {
        // Fix camelCase columns to snake_case
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "updatedAt" TO "updated_at"`);
      }

      // Check and rename other camelCase columns to snake_case
      const hasNativeName = await queryRunner.hasColumn('languages', 'native_name');
      const hasCamelNativeName = await queryRunner.hasColumn('languages', 'nativeName');
      if (!hasNativeName && hasCamelNativeName) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "nativeName" TO "native_name"`);
      }

      const hasIsActive = await queryRunner.hasColumn('languages', 'is_active');
      const hasCamelIsActive = await queryRunner.hasColumn('languages', 'isActive');
      if (!hasIsActive && hasCamelIsActive) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "isActive" TO "is_active"`);
      }

      const hasIsDefault = await queryRunner.hasColumn('languages', 'is_default');
      const hasCamelIsDefault = await queryRunner.hasColumn('languages', 'isDefault');
      if (!hasIsDefault && hasCamelIsDefault) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "isDefault" TO "is_default"`);
      }

      const hasSortOrder = await queryRunner.hasColumn('languages', 'sort_order');
      const hasCamelSortOrder = await queryRunner.hasColumn('languages', 'sortOrder');
      if (!hasSortOrder && hasCamelSortOrder) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "sortOrder" TO "sort_order"`);
      }
        
      // Add missing BaseEntity columns if they don't exist
      const hasVersion = await queryRunner.hasColumn('languages', 'version');
      if (!hasVersion) {
        await queryRunner.query(`ALTER TABLE "languages" ADD COLUMN "version" int NOT NULL DEFAULT 1`);
      }
      
      const hasCreatedBy = await queryRunner.hasColumn('languages', 'created_by');
      if (!hasCreatedBy) {
        await queryRunner.query(`ALTER TABLE "languages" ADD COLUMN "created_by" uuid`);
      }
      
      const hasUpdatedBy = await queryRunner.hasColumn('languages', 'updated_by');
      if (!hasUpdatedBy) {
        await queryRunner.query(`ALTER TABLE "languages" ADD COLUMN "updated_by" uuid`);
      }
      
      const hasDeletedAt = await queryRunner.hasColumn('languages', 'deleted_at');
      if (!hasDeletedAt) {
        await queryRunner.query(`ALTER TABLE "languages" ADD COLUMN "deleted_at" timestamp`);
      }
      
      const hasDeletedBy = await queryRunner.hasColumn('languages', 'deleted_by');
      if (!hasDeletedBy) {
        await queryRunner.query(`ALTER TABLE "languages" ADD COLUMN "deleted_by" uuid`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the languages table
    await queryRunner.query(`DROP TABLE IF EXISTS "languages"`);
  }
}