import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomerFieldsNullable1763400000000 implements MigrationInterface {
  name = 'UpdateCustomerFieldsNullable1763400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove unique constraint on email column
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "UQ_customers_email"`);

    // Make first_name column nullable
    await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "first_name" DROP NOT NULL`);

    // Make last_name column nullable
    await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "last_name" DROP NOT NULL`);

    // Make email column nullable
    await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Make first_name column NOT NULL (only if all values are not null)
    await queryRunner.query(`UPDATE "customers" SET "first_name" = 'Unnamed' WHERE "first_name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "first_name" SET NOT NULL`);

    // Make last_name column NOT NULL (only if all values are not null)
    await queryRunner.query(`UPDATE "customers" SET "last_name" = '' WHERE "last_name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "last_name" SET NOT NULL`);

    // Make email column NOT NULL (only if all values are not null)
    await queryRunner.query(`UPDATE "customers" SET "email" = '' WHERE "email" IS NULL`);
    await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" SET NOT NULL`);

    // Add unique constraint back on email (only if no duplicates exist)
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "UQ_customers_email" UNIQUE ("email")`);
  }
}