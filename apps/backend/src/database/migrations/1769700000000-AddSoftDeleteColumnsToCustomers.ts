import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteColumnsToCustomers1769700000000 implements MigrationInterface {
  name = 'AddSoftDeleteColumnsToCustomers1769700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deleted_by" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "deleted_by"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}
