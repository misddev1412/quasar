import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceSuppliersTable1762900000000 implements MigrationInterface {
  name = 'EnhanceSuppliersTable1762900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to existing suppliers table
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "logo" varchar(500),
      ADD COLUMN IF NOT EXISTS "website" varchar(500),
      ADD COLUMN IF NOT EXISTS "city" varchar(100),
      ADD COLUMN IF NOT EXISTS "country" varchar(100),
      ADD COLUMN IF NOT EXISTS "postal_code" varchar(20),
      ADD COLUMN IF NOT EXISTS "sort_order" int DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "deleted_at" timestamp,
      ADD COLUMN IF NOT EXISTS "version" int DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "created_by" uuid,
      ADD COLUMN IF NOT EXISTS "updated_by" uuid
    `);

    // Update column types and constraints to match our schema (only for existing columns)
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ALTER COLUMN "name" TYPE varchar(255)
    `);

    // Update contact_person column type if it exists, or add it if it doesn't
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'contact_person') THEN
          ALTER TABLE "suppliers" ALTER COLUMN "contact_person" TYPE varchar(100);
        ELSE
          ALTER TABLE "suppliers" ADD COLUMN "contact_person" varchar(100);
        END IF;
      END $$;
    `);

    // Update email column type if it exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'email') THEN
          ALTER TABLE "suppliers" ALTER COLUMN "email" TYPE varchar(100);
        END IF;
      END $$;
    `);

    // Update phone column type if it exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'phone') THEN
          ALTER TABLE "suppliers" ALTER COLUMN "phone" TYPE varchar(50);
        END IF;
      END $$;
    `);

    // Add unique constraint on name if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_suppliers_name') THEN
          ALTER TABLE "suppliers" ADD CONSTRAINT "UQ_suppliers_name" UNIQUE ("name");
        END IF;
      END $$;
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_suppliers_name"
      ON "suppliers" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_suppliers_email"
      ON "suppliers" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_suppliers_country"
      ON "suppliers" ("country")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_suppliers_is_active"
      ON "suppliers" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_suppliers_created_at"
      ON "suppliers" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove added columns
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "logo",
      DROP COLUMN IF EXISTS "website",
      DROP COLUMN IF EXISTS "city",
      DROP COLUMN IF EXISTS "country",
      DROP COLUMN IF EXISTS "postal_code",
      DROP COLUMN IF EXISTS "sort_order",
      DROP COLUMN IF EXISTS "deleted_at",
      DROP COLUMN IF EXISTS "version",
      DROP COLUMN IF EXISTS "created_by",
      DROP COLUMN IF EXISTS "updated_by"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_country"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_created_at"`);

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      DROP CONSTRAINT IF EXISTS "UQ_suppliers_name"
    `);
  }
}