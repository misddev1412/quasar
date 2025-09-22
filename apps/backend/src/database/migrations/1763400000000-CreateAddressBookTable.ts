import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddressBookTable1763400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "address_book" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "country_id" character varying NOT NULL,
        "province_id" character varying,
        "ward_id" character varying,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "company_name" character varying(255),
        "address_line_1" text NOT NULL,
        "address_line_2" text,
        "postal_code" character varying(20),
        "phone_number" character varying(50),
        "email" character varying(255),
        "address_type" character varying(20) NOT NULL DEFAULT 'BOTH' CHECK ("address_type" IN ('BILLING', 'SHIPPING', 'BOTH')),
        "is_default" boolean NOT NULL DEFAULT false,
        "label" character varying(100),
        "delivery_instructions" text,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" timestamp,
        CONSTRAINT "PK_address_book" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_address_book_customer_id" ON "address_book" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_address_book_country_id" ON "address_book" ("country_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_address_book_province_id" ON "address_book" ("province_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_address_book_ward_id" ON "address_book" ("ward_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_address_book_is_default" ON "address_book" ("is_default")`);
    await queryRunner.query(`CREATE INDEX "IDX_address_book_address_type" ON "address_book" ("address_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_address_book_customer_default" ON "address_book" ("customer_id", "is_default")`);

    // Create foreign keys
    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD CONSTRAINT "FK_address_book_customer_id"
      FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD CONSTRAINT "FK_address_book_country_id"
      FOREIGN KEY ("country_id") REFERENCES "countries"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD CONSTRAINT "FK_address_book_province_id"
      FOREIGN KEY ("province_id") REFERENCES "administrative_divisions"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD CONSTRAINT "FK_address_book_ward_id"
      FOREIGN KEY ("ward_id") REFERENCES "administrative_divisions"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "address_book"`);
  }
}