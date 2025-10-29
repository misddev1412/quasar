import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderFulfillmentTables1764300000000 implements MigrationInterface {
    name = 'CreateOrderFulfillmentTables1764300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create shipping_providers table
        await queryRunner.query(`
            CREATE TABLE "shipping_providers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying(100) NOT NULL,
                "code" character varying(50) NOT NULL,
                "website" character varying(255),
                "tracking_url" character varying(255),
                "api_key" character varying(255),
                "api_secret" character varying(255),
                "is_active" boolean NOT NULL DEFAULT true,
                "delivery_time_estimate" integer,
                "description" text,
                "contact_info" jsonb,
                "services" jsonb,
                CONSTRAINT "PK_shipping_providers" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_shipping_providers_code" UNIQUE ("code")
            )
        `);

        // Create order_fulfillments table
        await queryRunner.query(`
            CREATE TABLE "order_fulfillments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "order_id" uuid NOT NULL,
                "fulfillment_number" character varying(100) NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "shipping_provider_id" uuid,
                "tracking_number" character varying(255),
                "shipped_date" TIMESTAMP,
                "estimated_delivery_date" TIMESTAMP,
                "actual_delivery_date" TIMESTAMP,
                "shipping_cost" numeric(10,2) NOT NULL DEFAULT '0',
                "insurance_cost" numeric(10,2) NOT NULL DEFAULT '0',
                "packaging_type" character varying(50),
                "package_weight" numeric(8,3),
                "package_dimensions" character varying(100),
                "shipping_address" jsonb,
                "pickup_address" jsonb,
                "notes" text,
                "internal_notes" text,
                "signature_required" boolean NOT NULL DEFAULT false,
                "signature_received" boolean NOT NULL DEFAULT false,
                "signature_image_url" character varying(255),
                "delivery_instructions" text,
                "gift_wrap" boolean NOT NULL DEFAULT false,
                "gift_message" text,
                "priority_level" character varying(20) NOT NULL DEFAULT 'NORMAL',
                "fulfilled_by" uuid,
                "verified_by" uuid,
                "verified_at" TIMESTAMP,
                "cancel_reason" text,
                "cancelled_at" TIMESTAMP,
                CONSTRAINT "PK_order_fulfillments" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_order_fulfillments_fulfillment_number" UNIQUE ("fulfillment_number"),
                CONSTRAINT "FK_order_fulfillments_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_order_fulfillments_shipping_provider_id" FOREIGN KEY ("shipping_provider_id") REFERENCES "shipping_providers"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_order_fulfillments_fulfilled_by" FOREIGN KEY ("fulfilled_by") REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_order_fulfillments_verified_by" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // Create fulfillment_items table
        await queryRunner.query(`
            CREATE TABLE "fulfillment_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "fulfillment_id" uuid NOT NULL,
                "order_item_id" uuid NOT NULL,
                "quantity" integer NOT NULL,
                "fulfilled_quantity" integer NOT NULL DEFAULT '0',
                "returned_quantity" integer NOT NULL DEFAULT '0',
                "damaged_quantity" integer NOT NULL DEFAULT '0',
                "missing_quantity" integer NOT NULL DEFAULT '0',
                "location_picked_from" character varying(100),
                "batch_number" character varying(100),
                "serial_numbers" text,
                "expiry_date" TIMESTAMP,
                "condition_notes" text,
                "quality_check" boolean NOT NULL DEFAULT false,
                "quality_check_by" uuid,
                "quality_check_at" TIMESTAMP,
                "packaging_notes" text,
                "weight" numeric(8,3),
                "item_status" character varying NOT NULL DEFAULT 'PENDING',
                "notes" text,
                CONSTRAINT "PK_fulfillment_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_fulfillment_items_fulfillment_id" FOREIGN KEY ("fulfillment_id") REFERENCES "order_fulfillments"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_fulfillment_items_order_item_id" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_fulfillment_items_quality_check_by" FOREIGN KEY ("quality_check_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // Create delivery_tracking table
        await queryRunner.query(`
            CREATE TABLE "delivery_tracking" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "fulfillment_id" uuid NOT NULL,
                "tracking_number" character varying(255) NOT NULL,
                "status" character varying NOT NULL DEFAULT 'IN_TRANSIT',
                "location" character varying(255),
                "description" text,
                "event_date" TIMESTAMP,
                "estimated_delivery_date" TIMESTAMP,
                "delivery_attempts" integer NOT NULL DEFAULT '0',
                "recipient_name" character varying(100),
                "relationship" character varying(50),
                "photo_url" character varying(255),
                "notes" text,
                "is_delivered" boolean NOT NULL DEFAULT false,
                "is_exception" boolean NOT NULL DEFAULT false,
                "exception_reason" text,
                CONSTRAINT "PK_delivery_tracking" PRIMARY KEY ("id"),
                CONSTRAINT "FK_delivery_tracking_fulfillment_id" FOREIGN KEY ("fulfillment_id") REFERENCES "order_fulfillments"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_shipping_providers_code" ON "shipping_providers" ("code")`);
        await queryRunner.query(`CREATE INDEX "IDX_shipping_providers_is_active" ON "shipping_providers" ("is_active")`);

        await queryRunner.query(`CREATE INDEX "IDX_order_fulfillments_order_id" ON "order_fulfillments" ("order_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_fulfillments_shipping_provider_id" ON "order_fulfillments" ("shipping_provider_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_fulfillments_status" ON "order_fulfillments" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_fulfillments_fulfillment_number" ON "order_fulfillments" ("fulfillment_number")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_fulfillments_shipped_date" ON "order_fulfillments" ("shipped_date")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_fulfillments_fulfilled_by" ON "order_fulfillments" ("fulfilled_by")`);

        await queryRunner.query(`CREATE INDEX "IDX_fulfillment_items_fulfillment_id" ON "fulfillment_items" ("fulfillment_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_fulfillment_items_order_item_id" ON "fulfillment_items" ("order_item_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_fulfillment_items_item_status" ON "fulfillment_items" ("item_status")`);

        await queryRunner.query(`CREATE INDEX "IDX_delivery_tracking_fulfillment_id" ON "delivery_tracking" ("fulfillment_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_delivery_tracking_tracking_number" ON "delivery_tracking" ("tracking_number")`);
        await queryRunner.query(`CREATE INDEX "IDX_delivery_tracking_status" ON "delivery_tracking" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_delivery_tracking_event_date" ON "delivery_tracking" ("event_date")`);

        // Add check constraints for enum values
        await queryRunner.query(`
            ALTER TABLE "order_fulfillments"
            ADD CONSTRAINT "CHK_order_fulfillments_status"
            CHECK ("status" IN ('PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'))
        `);

        await queryRunner.query(`
            ALTER TABLE "order_fulfillments"
            ADD CONSTRAINT "CHK_order_fulfillments_priority_level"
            CHECK ("priority_level" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'))
        `);

        await queryRunner.query(`
            ALTER TABLE "order_fulfillments"
            ADD CONSTRAINT "CHK_order_fulfillments_packaging_type"
            CHECK ("packaging_type" IN ('ENVELOPE', 'BOX', 'CRATE', 'PALLET', 'CUSTOM'))
        `);

        await queryRunner.query(`
            ALTER TABLE "fulfillment_items"
            ADD CONSTRAINT "CHK_fulfillment_items_item_status"
            CHECK ("item_status" IN ('PENDING', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'DAMAGED', 'MISSING', 'CANCELLED'))
        `);

        await queryRunner.query(`
            ALTER TABLE "delivery_tracking"
            ADD CONSTRAINT "CHK_delivery_tracking_status"
            CHECK ("status" IN ('LABEL_CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT', 'EXCEPTION', 'RETURNED', 'LOST'))
        `);

        // Add check constraints for positive quantities
        await queryRunner.query(`ALTER TABLE "order_fulfillments" ADD CONSTRAINT "CHK_order_fulfillments_shipping_cost" CHECK ("shipping_cost" >= 0)`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" ADD CONSTRAINT "CHK_order_fulfillments_insurance_cost" CHECK ("insurance_cost" >= 0)`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" ADD CONSTRAINT "CHK_order_fulfillments_package_weight" CHECK ("package_weight" >= 0)`);

        await queryRunner.query(`ALTER TABLE "fulfillment_items" ADD CONSTRAINT "CHK_fulfillment_items_quantity" CHECK ("quantity" > 0)`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" ADD CONSTRAINT "CHK_fulfillment_items_fulfilled_quantity" CHECK ("fulfilled_quantity" >= 0)`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" ADD CONSTRAINT "CHK_fulfillment_items_returned_quantity" CHECK ("returned_quantity" >= 0)`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" ADD CONSTRAINT "CHK_fulfillment_items_damaged_quantity" CHECK ("damaged_quantity" >= 0)`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" ADD CONSTRAINT "CHK_fulfillment_items_missing_quantity" CHECK ("missing_quantity" >= 0)`);

        await queryRunner.query(`ALTER TABLE "delivery_tracking" ADD CONSTRAINT "CHK_delivery_tracking_delivery_attempts" CHECK ("delivery_attempts" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP CONSTRAINT "FK_delivery_tracking_fulfillment_id"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP CONSTRAINT "FK_fulfillment_items_quality_check_by"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP CONSTRAINT "FK_fulfillment_items_order_item_id"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP CONSTRAINT "FK_fulfillment_items_fulfillment_id"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "FK_order_fulfillments_verified_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "FK_order_fulfillments_fulfilled_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "FK_order_fulfillments_shipping_provider_id"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "FK_order_fulfillments_order_id"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_delivery_tracking_event_date"`);
        await queryRunner.query(`DROP INDEX "IDX_delivery_tracking_status"`);
        await queryRunner.query(`DROP INDEX "IDX_delivery_tracking_tracking_number"`);
        await queryRunner.query(`DROP INDEX "IDX_delivery_tracking_fulfillment_id"`);

        await queryRunner.query(`DROP INDEX "IDX_fulfillment_items_item_status"`);
        await queryRunner.query(`DROP INDEX "IDX_fulfillment_items_order_item_id"`);
        await queryRunner.query(`DROP INDEX "IDX_fulfillment_items_fulfillment_id"`);

        await queryRunner.query(`DROP INDEX "IDX_order_fulfillments_fulfilled_by"`);
        await queryRunner.query(`DROP INDEX "IDX_order_fulfillments_shipped_date"`);
        await queryRunner.query(`DROP INDEX "IDX_order_fulfillments_fulfillment_number"`);
        await queryRunner.query(`DROP INDEX "IDX_order_fulfillments_status"`);
        await queryRunner.query(`DROP INDEX "IDX_order_fulfillments_shipping_provider_id"`);
        await queryRunner.query(`DROP INDEX "IDX_order_fulfillments_order_id"`);

        await queryRunner.query(`DROP INDEX "IDX_shipping_providers_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_providers_code"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "delivery_tracking"`);
        await queryRunner.query(`DROP TABLE "fulfillment_items"`);
        await queryRunner.query(`DROP TABLE "order_fulfillments"`);
        await queryRunner.query(`DROP TABLE "shipping_providers"`);
    }
}