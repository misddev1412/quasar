import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomersTable1763100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "customer_number" character varying(100),
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone" character varying(50),
        "date_of_birth" date,
        "gender" character varying(20),
        "company_name" character varying(255),
        "job_title" character varying(100),
        "type" character varying(20) NOT NULL DEFAULT 'INDIVIDUAL' CHECK ("type" IN ('INDIVIDUAL', 'BUSINESS')),
        "status" character varying(20) NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING')),
        "language_preference" character varying(10) NOT NULL DEFAULT 'en',
        "currency_preference" character varying(3) NOT NULL DEFAULT 'USD',
        "timezone" character varying(100),
        "default_billing_address" jsonb,
        "default_shipping_address" jsonb,
        "marketing_consent" boolean NOT NULL DEFAULT false,
        "newsletter_subscribed" boolean NOT NULL DEFAULT false,
        "last_login_at" timestamp,
        "total_orders" integer NOT NULL DEFAULT 0,
        "total_spent" decimal(10,2) NOT NULL DEFAULT 0,
        "average_order_value" decimal(10,2) NOT NULL DEFAULT 0,
        "first_order_date" timestamp,
        "last_order_date" timestamp,
        "customer_tags" text[],
        "notes" text,
        "referral_source" character varying(100),
        "loyalty_points" integer NOT NULL DEFAULT 0,
        "tax_exempt" boolean NOT NULL DEFAULT false,
        "tax_id" character varying(100),
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "PK_customers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
        CONSTRAINT "UQ_customers_customer_number" UNIQUE ("customer_number")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_customers_user_id" ON "customers" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_email" ON "customers" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_customer_number" ON "customers" ("customer_number")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_status" ON "customers" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_type" ON "customers" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_created_at" ON "customers" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_last_order_date" ON "customers" ("last_order_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_total_spent" ON "customers" ("total_spent")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}