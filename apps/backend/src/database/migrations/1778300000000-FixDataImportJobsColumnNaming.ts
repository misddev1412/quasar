import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDataImportJobsColumnNaming1778300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "totalItems" TO "total_items"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "processedItems" TO "processed_items"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "failedItems" TO "failed_items"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "fileName" TO "file_name"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "createdBy" TO "created_by"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "updatedAt" TO "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "total_items" TO "totalItems"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "processed_items" TO "processedItems"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "failed_items" TO "failedItems"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "file_name" TO "fileName"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "created_by" TO "createdBy"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "created_at" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "data_import_jobs" RENAME COLUMN "updated_at" TO "updatedAt"`);
    }
}
