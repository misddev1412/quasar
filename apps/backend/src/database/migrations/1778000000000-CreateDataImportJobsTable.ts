import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDataImportJobsTable1778000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "data_import_jobs_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "data_import_jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "resource" varchar(50) NOT NULL,
        "status" "data_import_jobs_status_enum" NOT NULL DEFAULT 'pending',
        "progress" int NOT NULL DEFAULT 0,
        "totalItems" int NOT NULL DEFAULT 0,
        "processedItems" int NOT NULL DEFAULT 0,
        "failedItems" int NOT NULL DEFAULT 0,
        "result" jsonb NULL,
        "fileName" varchar NULL,
        "createdBy" varchar NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "data_import_jobs"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "data_import_jobs_status_enum"`);
    }
}
