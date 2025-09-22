import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnnecessaryCustomerFields1763300000000 implements MigrationInterface {
  name = 'RemoveUnnecessaryCustomerFields1763300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove unnecessary fields from customers table
    // These fields are not relevant for customers who don't login to the system

    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "language_preference"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "currency_preference"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "timezone"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "last_login_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the columns in case we need to rollback

    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN "language_preference" varchar(10) DEFAULT 'en'`);
    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN "currency_preference" varchar(3) DEFAULT 'USD'`);
    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN "timezone" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN "last_login_at" timestamp`);
  }
}