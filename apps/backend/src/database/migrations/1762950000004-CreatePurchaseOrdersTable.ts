import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePurchaseOrdersForWarehouse1762950000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, let's check what columns exist and only add/rename what's needed

    // Add new columns that don't exist yet
    await queryRunner.query(`
      ALTER TABLE "purchase_orders"
      ADD COLUMN IF NOT EXISTS "warehouse_id" uuid,
      ADD COLUMN IF NOT EXISTS "subtotal" decimal(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "tax_amount" decimal(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "shipping_cost" decimal(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "terms_and_conditions" text
    `);

    // Check and rename columns only if they exist with the old names
    // Skip renaming if columns already have the correct names
    const checkAndRename = async (oldName: string, newName: string) => {
      const result = await queryRunner.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'purchase_orders'
        AND column_name = '${oldName}'
      `);

      if (result.length > 0) {
        await queryRunner.query(`
          ALTER TABLE "purchase_orders"
          RENAME COLUMN "${oldName}" TO "${newName}"
        `);
      }
    };

    await checkAndRename('orderNumber', 'order_number');
    await checkAndRename('supplierId', 'supplier_id');
    await checkAndRename('orderDate', 'order_date');
    await checkAndRename('expectedDeliveryDate', 'expected_delivery_date');
    await checkAndRename('actualDeliveryDate', 'actual_delivery_date');
    await checkAndRename('totalAmount', 'total_amount');
    await checkAndRename('createdBy', 'created_by');
    await checkAndRename('approvedBy', 'approved_by');
    await checkAndRename('approvedAt', 'approved_at');
    await checkAndRename('createdAt', 'created_at');
    await checkAndRename('updatedAt', 'updated_at');

    // Update status enum to include new values
    await queryRunner.query(`
      ALTER TABLE "purchase_orders"
      DROP CONSTRAINT IF EXISTS "purchase_orders_status_check"
    `);

    await queryRunner.query(`
      ALTER TABLE "purchase_orders"
      ADD CONSTRAINT "purchase_orders_status_check"
      CHECK ("status" IN ('DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED'))
    `);

    // Add foreign key for warehouse if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "purchase_orders"
        ADD CONSTRAINT "FK_purchase_orders_warehouse"
        FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Update purchase_order_items table with same check-and-rename approach
    const checkAndRenameItems = async (oldName: string, newName: string) => {
      const result = await queryRunner.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'purchase_order_items'
        AND column_name = '${oldName}'
      `);

      if (result.length > 0) {
        await queryRunner.query(`
          ALTER TABLE "purchase_order_items"
          RENAME COLUMN "${oldName}" TO "${newName}"
        `);
      }
    };

    await checkAndRenameItems('purchaseOrderId', 'purchase_order_id');
    await checkAndRenameItems('variantId', 'product_variant_id');
    await checkAndRenameItems('quantity', 'quantity_ordered');
    await checkAndRenameItems('unitPrice', 'unit_cost');
    await checkAndRenameItems('totalPrice', 'total_cost');
    await checkAndRenameItems('createdAt', 'created_at');
    await checkAndRenameItems('updatedAt', 'updated_at');

    // Add new columns to purchase_order_items
    await queryRunner.query(`
      ALTER TABLE "purchase_order_items"
      ADD COLUMN IF NOT EXISTS "quantity_received" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "received_at" timestamp,
      ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0
    `);

    // Remove columns we don't need anymore (only if they exist)
    await queryRunner.query(`
      ALTER TABLE "purchase_order_items"
      DROP COLUMN IF EXISTS "productId",
      DROP COLUMN IF EXISTS "productName",
      DROP COLUMN IF EXISTS "sku"
    `);

    // Create new indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_purchase_orders_warehouse" ON "purchase_orders" ("warehouse_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_purchase_orders_status" ON "purchase_orders" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_purchase_orders_order_date" ON "purchase_orders" ("order_date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_purchase_orders_expected_delivery" ON "purchase_orders" ("expected_delivery_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes (simplified version)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_orders_warehouse"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_orders_order_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_orders_expected_delivery"`);

    await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT IF EXISTS "FK_purchase_orders_warehouse"`);

    await queryRunner.query(`
      ALTER TABLE "purchase_orders"
      DROP COLUMN IF EXISTS "warehouse_id",
      DROP COLUMN IF EXISTS "subtotal",
      DROP COLUMN IF EXISTS "tax_amount",
      DROP COLUMN IF EXISTS "shipping_cost",
      DROP COLUMN IF EXISTS "terms_and_conditions"
    `);

    await queryRunner.query(`
      ALTER TABLE "purchase_order_items"
      DROP COLUMN IF EXISTS "quantity_received",
      DROP COLUMN IF EXISTS "received_at",
      DROP COLUMN IF EXISTS "sort_order"
    `);
  }
}