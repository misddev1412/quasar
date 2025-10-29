import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameFulfillmentItemsTable1764900000000 implements MigrationInterface {
    name = 'RenameFulfillmentItemsTable1764900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fulfillment_items" RENAME TO "order_fulfillment_items"`);

        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "PK_fulfillment_items" TO "PK_order_fulfillment_items"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_fulfillment_items_fulfillment_id" TO "FK_order_fulfillment_items_fulfillment_id"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_fulfillment_items_order_item_id" TO "FK_order_fulfillment_items_order_item_id"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_fulfillment_items_quality_check_by" TO "FK_order_fulfillment_items_quality_check_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_fulfillment_items_created_by" TO "FK_order_fulfillment_items_created_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_fulfillment_items_updated_by" TO "FK_order_fulfillment_items_updated_by"`);

        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_item_status" TO "CHK_order_fulfillment_items_item_status"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_quantity" TO "CHK_order_fulfillment_items_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_fulfilled_quantity" TO "CHK_order_fulfillment_items_fulfilled_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_returned_quantity" TO "CHK_order_fulfillment_items_returned_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_damaged_quantity" TO "CHK_order_fulfillment_items_damaged_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_missing_quantity" TO "CHK_order_fulfillment_items_missing_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_fulfillment_items_version" TO "CHK_order_fulfillment_items_version"`);

        await queryRunner.query(`ALTER INDEX "IDX_fulfillment_items_fulfillment_id" RENAME TO "IDX_order_fulfillment_items_fulfillment_id"`);
        await queryRunner.query(`ALTER INDEX "IDX_fulfillment_items_order_item_id" RENAME TO "IDX_order_fulfillment_items_order_item_id"`);
        await queryRunner.query(`ALTER INDEX "IDX_fulfillment_items_item_status" RENAME TO "IDX_order_fulfillment_items_item_status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER INDEX "IDX_order_fulfillment_items_item_status" RENAME TO "IDX_fulfillment_items_item_status"`);
        await queryRunner.query(`ALTER INDEX "IDX_order_fulfillment_items_order_item_id" RENAME TO "IDX_fulfillment_items_order_item_id"`);
        await queryRunner.query(`ALTER INDEX "IDX_order_fulfillment_items_fulfillment_id" RENAME TO "IDX_fulfillment_items_fulfillment_id"`);

        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_version" TO "CHK_fulfillment_items_version"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_missing_quantity" TO "CHK_fulfillment_items_missing_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_damaged_quantity" TO "CHK_fulfillment_items_damaged_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_returned_quantity" TO "CHK_fulfillment_items_returned_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_fulfilled_quantity" TO "CHK_fulfillment_items_fulfilled_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_quantity" TO "CHK_fulfillment_items_quantity"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "CHK_order_fulfillment_items_item_status" TO "CHK_fulfillment_items_item_status"`);

        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_order_fulfillment_items_updated_by" TO "FK_fulfillment_items_updated_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_order_fulfillment_items_created_by" TO "FK_fulfillment_items_created_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_order_fulfillment_items_quality_check_by" TO "FK_fulfillment_items_quality_check_by"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_order_fulfillment_items_order_item_id" TO "FK_fulfillment_items_order_item_id"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "FK_order_fulfillment_items_fulfillment_id" TO "FK_fulfillment_items_fulfillment_id"`);
        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME CONSTRAINT "PK_order_fulfillment_items" TO "PK_fulfillment_items"`);

        await queryRunner.query(`ALTER TABLE "order_fulfillment_items" RENAME TO "fulfillment_items"`);
    }
}
