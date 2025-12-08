import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingBaseEntityColumnsToOrderTables1763200000000 implements MigrationInterface {
  name = 'AddMissingBaseEntityColumnsToOrderTables1763200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to orders table

    // Check if version column exists before adding
    const versionExistsOrders = await queryRunner.hasColumn("orders", "version");
    if (!versionExistsOrders) {
      await queryRunner.query(`
        ALTER TABLE "orders"
        ADD COLUMN "version" integer NOT NULL DEFAULT 1
      `);
    }

    // Check if created_by column exists before adding
    const createdByExistsOrders = await queryRunner.hasColumn("orders", "created_by");
    if (!createdByExistsOrders) {
      await queryRunner.query(`
        ALTER TABLE "orders"
        ADD COLUMN "created_by" uuid
      `);
    }

    // Check if updated_by column exists before adding
    const updatedByExistsOrders = await queryRunner.hasColumn("orders", "updated_by");
    if (!updatedByExistsOrders) {
      await queryRunner.query(`
        ALTER TABLE "orders"
        ADD COLUMN "updated_by" uuid
      `);
    }

    // Add missing columns to order_items table

    // Check if version column exists before adding
    const versionExistsOrderItems = await queryRunner.hasColumn("order_items", "version");
    if (!versionExistsOrderItems) {
      await queryRunner.query(`
        ALTER TABLE "order_items"
        ADD COLUMN "version" integer NOT NULL DEFAULT 1
      `);
    }

    // Check if created_by column exists before adding
    const createdByExistsOrderItems = await queryRunner.hasColumn("order_items", "created_by");
    if (!createdByExistsOrderItems) {
      await queryRunner.query(`
        ALTER TABLE "order_items"
        ADD COLUMN "created_by" uuid
      `);
    }

    // Check if updated_by column exists before adding
    const updatedByExistsOrderItems = await queryRunner.hasColumn("order_items", "updated_by");
    if (!updatedByExistsOrderItems) {
      await queryRunner.query(`
        ALTER TABLE "order_items"
        ADD COLUMN "updated_by" uuid
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns from order_items table first

    const updatedByExistsOrderItems = await queryRunner.hasColumn("order_items", "updated_by");
    if (updatedByExistsOrderItems) {
      await queryRunner.query(`
        ALTER TABLE "order_items"
        DROP COLUMN "updated_by"
      `);
    }

    const createdByExistsOrderItems = await queryRunner.hasColumn("order_items", "created_by");
    if (createdByExistsOrderItems) {
      await queryRunner.query(`
        ALTER TABLE "order_items"
        DROP COLUMN "created_by"
      `);
    }

    const versionExistsOrderItems = await queryRunner.hasColumn("order_items", "version");
    if (versionExistsOrderItems) {
      await queryRunner.query(`
        ALTER TABLE "order_items"
        DROP COLUMN "version"
      `);
    }

    // Drop columns from orders table

    const updatedByExistsOrders = await queryRunner.hasColumn("orders", "updated_by");
    if (updatedByExistsOrders) {
      await queryRunner.query(`
        ALTER TABLE "orders"
        DROP COLUMN "updated_by"
      `);
    }

    const createdByExistsOrders = await queryRunner.hasColumn("orders", "created_by");
    if (createdByExistsOrders) {
      await queryRunner.query(`
        ALTER TABLE "orders"
        DROP COLUMN "created_by"
      `);
    }

    const versionExistsOrders = await queryRunner.hasColumn("orders", "version");
    if (versionExistsOrders) {
      await queryRunner.query(`
        ALTER TABLE "orders"
        DROP COLUMN "version"
      `);
    }
  }
}