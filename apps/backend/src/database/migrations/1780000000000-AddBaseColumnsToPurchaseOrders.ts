import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseColumnsToPurchaseOrders1780000000000 implements MigrationInterface {
  name = 'AddBaseColumnsToPurchaseOrders1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const purchaseOrdersVersionExists = await queryRunner.hasColumn('purchase_orders', 'version');
    if (!purchaseOrdersVersionExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_orders"
        ADD COLUMN "version" integer NOT NULL DEFAULT 1
      `);
    }

    const purchaseOrdersUpdatedByExists = await queryRunner.hasColumn('purchase_orders', 'updated_by');
    if (!purchaseOrdersUpdatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_orders"
        ADD COLUMN "updated_by" uuid
      `);
    }

    const purchaseOrderItemsVersionExists = await queryRunner.hasColumn('purchase_order_items', 'version');
    if (!purchaseOrderItemsVersionExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_order_items"
        ADD COLUMN "version" integer NOT NULL DEFAULT 1
      `);
    }

    const purchaseOrderItemsCreatedByExists = await queryRunner.hasColumn('purchase_order_items', 'created_by');
    if (!purchaseOrderItemsCreatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_order_items"
        ADD COLUMN "created_by" uuid
      `);
    }

    const purchaseOrderItemsUpdatedByExists = await queryRunner.hasColumn('purchase_order_items', 'updated_by');
    if (!purchaseOrderItemsUpdatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_order_items"
        ADD COLUMN "updated_by" uuid
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const purchaseOrderItemsUpdatedByExists = await queryRunner.hasColumn('purchase_order_items', 'updated_by');
    if (purchaseOrderItemsUpdatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_order_items"
        DROP COLUMN "updated_by"
      `);
    }

    const purchaseOrderItemsCreatedByExists = await queryRunner.hasColumn('purchase_order_items', 'created_by');
    if (purchaseOrderItemsCreatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_order_items"
        DROP COLUMN "created_by"
      `);
    }

    const purchaseOrderItemsVersionExists = await queryRunner.hasColumn('purchase_order_items', 'version');
    if (purchaseOrderItemsVersionExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_order_items"
        DROP COLUMN "version"
      `);
    }

    const purchaseOrdersUpdatedByExists = await queryRunner.hasColumn('purchase_orders', 'updated_by');
    if (purchaseOrdersUpdatedByExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_orders"
        DROP COLUMN "updated_by"
      `);
    }

    const purchaseOrdersVersionExists = await queryRunner.hasColumn('purchase_orders', 'version');
    if (purchaseOrdersVersionExists) {
      await queryRunner.query(`
        ALTER TABLE "purchase_orders"
        DROP COLUMN "version"
      `);
    }
  }
}
