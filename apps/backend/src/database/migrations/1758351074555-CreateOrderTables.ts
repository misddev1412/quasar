import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTables1758351074555 implements MigrationInterface {
    name = 'CreateOrderTables1758351074555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create orders table
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "order_number" character varying(100) NOT NULL,
                "customer_id" uuid,
                "customer_email" character varying(255) NOT NULL,
                "customer_phone" character varying(50),
                "customer_name" character varying(255) NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "payment_status" character varying NOT NULL DEFAULT 'PENDING',
                "source" character varying NOT NULL DEFAULT 'WEBSITE',
                "order_date" TIMESTAMP NOT NULL DEFAULT now(),
                "subtotal" numeric(10,2) NOT NULL DEFAULT '0',
                "tax_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "shipping_cost" numeric(10,2) NOT NULL DEFAULT '0',
                "discount_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "total_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'USD',
                "billing_address" jsonb,
                "shipping_address" jsonb,
                "payment_method" character varying(100),
                "payment_reference" character varying(255),
                "shipping_method" character varying(100),
                "tracking_number" character varying(255),
                "shipped_date" TIMESTAMP,
                "delivered_date" TIMESTAMP,
                "estimated_delivery_date" TIMESTAMP,
                "notes" text,
                "customer_notes" text,
                "internal_notes" text,
                "discount_code" character varying(100),
                "is_gift" boolean NOT NULL DEFAULT false,
                "gift_message" text,
                "cancelled_at" TIMESTAMP,
                "cancelled_reason" text,
                "refunded_at" TIMESTAMP,
                "refund_amount" numeric(10,2),
                "refund_reason" text,
                CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number")
            )
        `);

        // Create order_items table
        await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "order_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "product_variant_id" uuid,
                "product_name" character varying(255) NOT NULL,
                "product_sku" character varying(100),
                "variant_name" character varying(255),
                "variant_sku" character varying(100),
                "quantity" integer NOT NULL,
                "unit_price" numeric(10,2) NOT NULL,
                "total_price" numeric(10,2) NOT NULL,
                "discount_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "tax_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "product_image" text,
                "product_attributes" jsonb,
                "is_digital" boolean NOT NULL DEFAULT false,
                "weight" numeric(8,3),
                "dimensions" character varying(100),
                "requires_shipping" boolean NOT NULL DEFAULT true,
                "is_gift_card" boolean NOT NULL DEFAULT false,
                "gift_card_code" character varying(100),
                "notes" text,
                "fulfilled_quantity" integer NOT NULL DEFAULT '0',
                "refunded_quantity" integer NOT NULL DEFAULT '0',
                "returned_quantity" integer NOT NULL DEFAULT '0',
                "sort_order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD CONSTRAINT "FK_order_items_order_id"
            FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_orders_customer_id" ON "orders" ("customer_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_customer_email" ON "orders" ("customer_email")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_payment_status" ON "orders" ("payment_status")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_order_date" ON "orders" ("order_date")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_source" ON "orders" ("source")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_product_variant_id" ON "order_items" ("product_variant_id")`);

        // Add check constraints for enum values
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "CHK_orders_status"
            CHECK ("status" IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'))
        `);

        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "CHK_orders_payment_status"
            CHECK ("payment_status" IN ('PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED'))
        `);

        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "CHK_orders_source"
            CHECK ("source" IN ('WEBSITE', 'MOBILE_APP', 'PHONE', 'EMAIL', 'IN_STORE', 'SOCIAL_MEDIA', 'MARKETPLACE'))
        `);

        // Add check constraints for positive amounts
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_subtotal" CHECK ("subtotal" >= 0)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_tax_amount" CHECK ("tax_amount" >= 0)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_shipping_cost" CHECK ("shipping_cost" >= 0)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_discount_amount" CHECK ("discount_amount" >= 0)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_total_amount" CHECK ("total_amount" >= 0)`);

        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_quantity" CHECK ("quantity" > 0)`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_unit_price" CHECK ("unit_price" >= 0)`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_total_price" CHECK ("total_price" >= 0)`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_fulfilled_quantity" CHECK ("fulfilled_quantity" >= 0)`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_refunded_quantity" CHECK ("refunded_quantity" >= 0)`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_returned_quantity" CHECK ("returned_quantity" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order_id"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_orders_customer_id"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_customer_email"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_payment_status"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_order_date"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_source"`);
        await queryRunner.query(`DROP INDEX "IDX_order_items_order_id"`);
        await queryRunner.query(`DROP INDEX "IDX_order_items_product_id"`);
        await queryRunner.query(`DROP INDEX "IDX_order_items_product_variant_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }
}
