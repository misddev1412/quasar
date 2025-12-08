import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLanguagesColumnNaming1755000000000 implements MigrationInterface {
  name = 'UpdateLanguagesColumnNaming1755000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename camelCase columns to snake_case to match entity definitions
    const tableExists = await queryRunner.hasTable('languages');
    
    if (tableExists) {
      // Check and rename nativeName to native_name
      const hasNativeName = await queryRunner.hasColumn('languages', 'native_name');
      const hasCamelNativeName = await queryRunner.hasColumn('languages', 'nativeName');
      if (!hasNativeName && hasCamelNativeName) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "nativeName" TO "native_name"`);
      }

      // Check and rename isActive to is_active
      const hasIsActive = await queryRunner.hasColumn('languages', 'is_active');
      const hasCamelIsActive = await queryRunner.hasColumn('languages', 'isActive');
      if (!hasIsActive && hasCamelIsActive) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "isActive" TO "is_active"`);
      }

      // Check and rename isDefault to is_default
      const hasIsDefault = await queryRunner.hasColumn('languages', 'is_default');
      const hasCamelIsDefault = await queryRunner.hasColumn('languages', 'isDefault');
      if (!hasIsDefault && hasCamelIsDefault) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "isDefault" TO "is_default"`);
      }

      // Check and rename sortOrder to sort_order
      const hasSortOrder = await queryRunner.hasColumn('languages', 'sort_order');
      const hasCamelSortOrder = await queryRunner.hasColumn('languages', 'sortOrder');
      if (!hasSortOrder && hasCamelSortOrder) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "sortOrder" TO "sort_order"`);
      }

      // Drop old indexes and create new ones with correct column names
      try {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LANGUAGE_ACTIVE"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LANGUAGE_DEFAULT"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LANGUAGE_SORT_ORDER"`);
      } catch (error) {
        // Indexes might not exist, continue
      }

      // Create new indexes with snake_case column names
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_ACTIVE" ON "languages" ("is_active")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_DEFAULT" ON "languages" ("is_default")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_SORT_ORDER" ON "languages" ("sort_order")`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert snake_case columns back to camelCase
    const tableExists = await queryRunner.hasTable('languages');
    
    if (tableExists) {
      // Drop snake_case indexes
      try {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LANGUAGE_ACTIVE"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LANGUAGE_DEFAULT"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LANGUAGE_SORT_ORDER"`);
      } catch (error) {
        // Continue if indexes don't exist
      }

      // Rename columns back to camelCase
      const hasNativeName = await queryRunner.hasColumn('languages', 'native_name');
      if (hasNativeName) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "native_name" TO "nativeName"`);
      }

      const hasIsActive = await queryRunner.hasColumn('languages', 'is_active');
      if (hasIsActive) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "is_active" TO "isActive"`);
      }

      const hasIsDefault = await queryRunner.hasColumn('languages', 'is_default');
      if (hasIsDefault) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "is_default" TO "isDefault"`);
      }

      const hasSortOrder = await queryRunner.hasColumn('languages', 'sort_order');
      if (hasSortOrder) {
        await queryRunner.query(`ALTER TABLE "languages" RENAME COLUMN "sort_order" TO "sortOrder"`);
      }

      // Recreate camelCase indexes
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_ACTIVE" ON "languages" ("isActive")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_DEFAULT" ON "languages" ("isDefault")`);
      await queryRunner.query(`CREATE INDEX "IDX_LANGUAGE_SORT_ORDER" ON "languages" ("sortOrder")`);
    }
  }
}