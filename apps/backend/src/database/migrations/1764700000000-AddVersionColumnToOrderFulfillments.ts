import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionColumnToOrderFulfillments1764700000000 implements MigrationInterface {
    name = 'AddVersionColumnToOrderFulfillments1764700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add version column to order_fulfillments table
        await queryRunner.query(`
            ALTER TABLE "order_fulfillments"
            ADD COLUMN "version" integer NOT NULL DEFAULT 1
        `);

        // Add version column to fulfillment_items table
        await queryRunner.query(`
            ALTER TABLE "fulfillment_items"
            ADD COLUMN "version" integer NOT NULL DEFAULT 1
        `);

        // Add version column to delivery_tracking table
        await queryRunner.query(`
            ALTER TABLE "delivery_tracking"
            ADD COLUMN "version" integer NOT NULL DEFAULT 1
        `);

        // Add version column to shipping_providers table
        await queryRunner.query(`
            ALTER TABLE "shipping_providers"
            ADD COLUMN "version" integer NOT NULL DEFAULT 1
        `);

        // Add check constraint for version to ensure non-negative values
        await queryRunner.query(`ALTER TABLE "order_fulfillments" ADD CONSTRAINT "CHK_order_fulfillments_version" CHECK ("version" >= 0)`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" ADD CONSTRAINT "CHK_fulfillment_items_version" CHECK ("version" >= 0)`);
        await queryRunner.query(`ALTER TABLE "delivery_tracking" ADD CONSTRAINT "CHK_delivery_tracking_version" CHECK ("version" >= 0)`);
        await queryRunner.query(`ALTER TABLE "shipping_providers" ADD CONSTRAINT "CHK_shipping_providers_version" CHECK ("version" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop check constraints first
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP CONSTRAINT "CHK_order_fulfillments_version"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP CONSTRAINT "CHK_fulfillment_items_version"`);
        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP CONSTRAINT "CHK_delivery_tracking_version"`);
        await queryRunner.query(`ALTER TABLE "shipping_providers" DROP CONSTRAINT "CHK_shipping_providers_version"`);

        // Drop version columns
        await queryRunner.query(`ALTER TABLE "order_fulfillments" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "fulfillment_items" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "delivery_tracking" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "shipping_providers" DROP COLUMN "version"`);
    }
}