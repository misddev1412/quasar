import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureOrdersPaymentDataColumn1770600000000 implements MigrationInterface {
  name = 'EnsureOrdersPaymentDataColumn1770600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_data" jsonb`);

    // Some older databases might still use the singular "order" table name
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'order' AND table_schema = current_schema()
        ) THEN
          EXECUTE 'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "payment_data" jsonb';
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "payment_data"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'order' AND table_schema = current_schema()
        ) THEN
          EXECUTE 'ALTER TABLE "order" DROP COLUMN IF EXISTS "payment_data"';
        END IF;
      END;
      $$;
    `);
  }
}
