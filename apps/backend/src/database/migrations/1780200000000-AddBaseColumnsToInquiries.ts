import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseColumnsToInquiries1780200000000 implements MigrationInterface {
  name = 'AddBaseColumnsToInquiries1780200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('inquiries');
    if (!tableExists) {
      return;
    }

    const versionExists = await queryRunner.hasColumn('inquiries', 'version');
    if (!versionExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        ADD COLUMN "version" integer NOT NULL DEFAULT 1
      `);
    }

    const createdByExists = await queryRunner.hasColumn('inquiries', 'created_by');
    if (!createdByExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        ADD COLUMN "created_by" uuid NULL
      `);
    }

    const updatedByExists = await queryRunner.hasColumn('inquiries', 'updated_by');
    if (!updatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        ADD COLUMN "updated_by" uuid NULL
      `);
    }

    const deletedByExists = await queryRunner.hasColumn('inquiries', 'deleted_by');
    if (!deletedByExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        ADD COLUMN "deleted_by" uuid NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('inquiries');
    if (!tableExists) {
      return;
    }

    const deletedByExists = await queryRunner.hasColumn('inquiries', 'deleted_by');
    if (deletedByExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        DROP COLUMN "deleted_by"
      `);
    }

    const updatedByExists = await queryRunner.hasColumn('inquiries', 'updated_by');
    if (updatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        DROP COLUMN "updated_by"
      `);
    }

    const createdByExists = await queryRunner.hasColumn('inquiries', 'created_by');
    if (createdByExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        DROP COLUMN "created_by"
      `);
    }

    const versionExists = await queryRunner.hasColumn('inquiries', 'version');
    if (versionExists) {
      await queryRunner.query(`
        ALTER TABLE "inquiries"
        DROP COLUMN "version"
      `);
    }
  }
}

