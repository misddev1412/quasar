import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDataExportJobsTable1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "data_export_job_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "data_export_jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "version" INT NOT NULL DEFAULT 1,
        "created_by" uuid NULL,
        "updated_by" uuid NULL,
        "resource" VARCHAR(120) NOT NULL,
        "format" VARCHAR(50) NOT NULL DEFAULT 'csv',
        "status" data_export_job_status_enum NOT NULL DEFAULT 'pending',
        "filters" JSONB NULL,
        "columns" JSONB NULL,
        "options" JSONB NULL,
        "total_records" INT NULL,
        "file_url" TEXT NULL,
        "file_name" TEXT NULL,
        "file_size" BIGINT NULL,
        "storage_provider" VARCHAR(20) NULL,
        "completed_at" TIMESTAMP NULL,
        "error" TEXT NULL,
        "requested_by" uuid NULL
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_data_export_jobs_resource" ON "data_export_jobs" ("resource")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_data_export_jobs_status" ON "data_export_jobs" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_data_export_jobs_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_data_export_jobs_resource"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "data_export_jobs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "data_export_job_status_enum"`);
  }
}
