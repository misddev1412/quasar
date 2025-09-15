import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingBaseEntityColumnsToProductMediaTable1762700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if version column exists before adding
    const versionExists = await queryRunner.hasColumn("product_media", "version");
    if (!versionExists) {
      await queryRunner.query(`
        ALTER TABLE "product_media"
        ADD COLUMN "version" integer NOT NULL DEFAULT 1
      `);
    }

    // Check if created_by column exists before adding
    const createdByExists = await queryRunner.hasColumn("product_media", "created_by");
    if (!createdByExists) {
      await queryRunner.query(`
        ALTER TABLE "product_media"
        ADD COLUMN "created_by" uuid
      `);
    }

    // Check if updated_by column exists before adding
    const updatedByExists = await queryRunner.hasColumn("product_media", "updated_by");
    if (!updatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "product_media"
        ADD COLUMN "updated_by" uuid
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns in reverse order, only if they exist
    const updatedByExists = await queryRunner.hasColumn("product_media", "updated_by");
    if (updatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "product_media"
        DROP COLUMN "updated_by"
      `);
    }

    const createdByExists = await queryRunner.hasColumn("product_media", "created_by");
    if (createdByExists) {
      await queryRunner.query(`
        ALTER TABLE "product_media"
        DROP COLUMN "created_by"
      `);
    }

    const versionExists = await queryRunner.hasColumn("product_media", "version");
    if (versionExists) {
      await queryRunner.query(`
        ALTER TABLE "product_media"
        DROP COLUMN "version"
      `);
    }
  }
}