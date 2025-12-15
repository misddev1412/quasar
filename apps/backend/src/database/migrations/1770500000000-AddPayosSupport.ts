import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayosSupport1770500000000 implements MigrationInterface {
  name = 'AddPayosSupport1770500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_data" jsonb`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_methods_type_enum') THEN
          BEGIN
            ALTER TYPE "public"."payment_methods_type_enum" ADD VALUE IF NOT EXISTS 'PAYOS';
          EXCEPTION
            WHEN duplicate_object THEN NULL;
          END;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "payment_data"`);
    // Note: PostgreSQL enum values cannot be removed easily once added.
  }
}
