import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupplierTranslationsTable1762900000001 implements MigrationInterface {
  name = 'CreateSupplierTranslationsTable1762900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create supplier_translations table
    await queryRunner.query(`
      CREATE TABLE "supplier_translations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "supplier_id" uuid NOT NULL,
        "locale" varchar(5) NOT NULL,
        "name" varchar(255),
        "description" text,
        "address" text,
        "city" varchar(100),
        "country" varchar(100),
        "contact_person" varchar(100),
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp,
        "version" int DEFAULT 1,
        "createdBy" uuid,
        "updatedBy" uuid
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "supplier_translations"
      ADD CONSTRAINT "FK_supplier_translations_supplier_id"
      FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id")
      ON DELETE CASCADE
    `);

    // Add unique constraint for supplier_id + locale
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_SUPPLIER_TRANSLATIONS_SUPPLIER_ID_LOCALE"
      ON "supplier_translations" ("supplier_id", "locale")
    `);

    // Add index for locale
    await queryRunner.query(`
      CREATE INDEX "IDX_SUPPLIER_TRANSLATIONS_LOCALE"
      ON "supplier_translations" ("locale")
    `);

    // Add index for supplier_id
    await queryRunner.query(`
      CREATE INDEX "IDX_SUPPLIER_TRANSLATIONS_SUPPLIER_ID"
      ON "supplier_translations" ("supplier_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "supplier_translations"`);
  }
}