import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedUpdatedByColumnsToFulfillmentTables1764800000000 implements MigrationInterface {
    name = 'AddCreatedUpdatedByColumnsToFulfillmentTables1764800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add created_by and updated_by columns to order_fulfillments table
        await queryRunner.query(`
            ALTER TABLE "order_fulfillments"
            ADD COLUMN "created_by" uuid,
            ADD COLUMN "updated_by" uuid
        `);

        // Add created_by and updated_by columns to fulfillment_items table
        await queryRunner.query(`
            ALTER TABLE "fulfillment_items"
            ADD COLUMN "created_by" uuid,
            ADD COLUMN "updated_by" uuid
        `);

        // Add created_by and updated_by columns to delivery_tracking table
        await queryRunner.query(`
            ALTER TABLE "delivery_tracking"
            ADD COLUMN "created_by" uuid,
            ADD COLUMN "updated_by" uuid
        `);

        // Add created_by and updated_by columns to shipping_providers table
        await queryRunner.query(`
            ALTER TABLE "shipping_providers"
            ADD COLUMN "created_by" uuid,
            ADD COLUMN "updated_by" uuid
        `);

        // Add foreign key constraints for created_by and updated_by columns
        await queryRunner.query(`
            ALTER TABLE "order_fulfillments"
            ADD CONSTRAINT "FK_order_fulfillments_created_by"
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_order_fulfillments_updated_by"
            FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "fulfillment_items"
            ADD CONSTRAINT "FK_fulfillment_items_created_by"
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_fulfillment_items_updated_by"
            FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "delivery_tracking"
            ADD CONSTRAINT "FK_delivery_tracking_created_by"
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_delivery_tracking_updated_by"
            FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "shipping_providers"
            ADD CONSTRAINT "FK_shipping_providers_created_by"
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_shipping_providers_updated_by"
            FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "FK_order_fulfillments_created_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "FK_order_fulfillments_updated_by"`);

        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP CONSTRAINT "FK_fulfillment_items_created_by"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP CONSTRAINT "FK_fulfillment_items_updated_by"`);

        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP CONSTRAINT "FK_delivery_tracking_created_by"`);
        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP CONSTRAINT "FK_delivery_tracking_updated_by"`);

        await queryRunner.query(`ALTER TABLE "shipping_providers" DROP CONSTRAINT "FK_shipping_providers_created_by"`);
        await queryRunner.query(`ALTER TABLE "shipping_providers" DROP CONSTRAINT "FK_shipping_providers_updated_by"`);

        // Drop created_by and updated_by columns
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP COLUMN "updated_by"`);

        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP COLUMN "updated_by"`);

        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP COLUMN "updated_by"`);

        await queryRunner.query(`ALTER TABLE "shipping_providers" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "shipping_providers" DROP COLUMN "updated_by"`);
    }
}