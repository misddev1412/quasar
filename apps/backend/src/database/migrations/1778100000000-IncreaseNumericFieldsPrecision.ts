import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseNumericFieldsPrecision1778100000000 implements MigrationInterface {
  name = 'IncreaseNumericFieldsPrecision1778100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Products table
    await queryRunner.query(`
      ALTER TABLE "products" 
      ALTER COLUMN "price" TYPE numeric(15,2),
      ALTER COLUMN "compareAtPrice" TYPE numeric(15,2)
    `);

    // Product Variants table
    await queryRunner.query(`
      ALTER TABLE "product_variants" 
      ALTER COLUMN "price" TYPE numeric(15,2),
      ALTER COLUMN "compare_at_price" TYPE numeric(15,2),
      ALTER COLUMN "cost_price" TYPE numeric(15,2)
    `);

    // Orders table
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ALTER COLUMN "subtotal" TYPE numeric(15,2),
      ALTER COLUMN "tax_amount" TYPE numeric(15,2),
      ALTER COLUMN "shipping_cost" TYPE numeric(15,2),
      ALTER COLUMN "discount_amount" TYPE numeric(15,2),
      ALTER COLUMN "total_amount" TYPE numeric(15,2),
      ALTER COLUMN "amount_paid" TYPE numeric(15,2),
      ALTER COLUMN "refund_amount" TYPE numeric(15,2)
    `);

    // Order Items table
    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ALTER COLUMN "unit_price" TYPE numeric(15,2),
      ALTER COLUMN "total_price" TYPE numeric(15,2),
      ALTER COLUMN "discount_amount" TYPE numeric(15,2),
      ALTER COLUMN "tax_amount" TYPE numeric(15,2)
    `);

    // Purchase Orders table
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" 
      ALTER COLUMN "subtotal" TYPE numeric(15,2),
      ALTER COLUMN "tax_amount" TYPE numeric(15,2),
      ALTER COLUMN "shipping_cost" TYPE numeric(15,2),
      ALTER COLUMN "total_amount" TYPE numeric(15,2)
    `);

    // Purchase Order Items table
    await queryRunner.query(`
      ALTER TABLE "purchase_order_items" 
      ALTER COLUMN "unit_price" TYPE numeric(15,2),
      ALTER COLUMN "total_price" TYPE numeric(15,2)
    `);

    // Inventory Items table
    await queryRunner.query(`
      ALTER TABLE "inventory_items" 
      ALTER COLUMN "unit_cost" TYPE numeric(15,2)
    `);

    // Stock Movements table
    await queryRunner.query(`
      ALTER TABLE "stock_movements" 
      ALTER COLUMN "unit_cost" TYPE numeric(15,2)
    `);

    // Services table
    await queryRunner.query(`
      ALTER TABLE "services" 
      ALTER COLUMN "unit_price" TYPE numeric(15,2)
    `);

    // Service Items table
    await queryRunner.query(`
      ALTER TABLE "service_items" 
      ALTER COLUMN "price" TYPE numeric(15,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Service Items table
    await queryRunner.query(`
      ALTER TABLE "service_items" 
      ALTER COLUMN "price" TYPE numeric(10,2)
    `);

    // Services table
    await queryRunner.query(`
      ALTER TABLE "services" 
      ALTER COLUMN "unit_price" TYPE numeric(10,2)
    `);

    // Stock Movements table
    await queryRunner.query(`
      ALTER TABLE "stock_movements" 
      ALTER COLUMN "unit_cost" TYPE numeric(10,2)
    `);

    // Inventory Items table
    await queryRunner.query(`
      ALTER TABLE "inventory_items" 
      ALTER COLUMN "unit_cost" TYPE numeric(10,2)
    `);

    // Purchase Order Items table
    await queryRunner.query(`
      ALTER TABLE "purchase_order_items" 
      ALTER COLUMN "unit_price" TYPE numeric(10,2),
      ALTER COLUMN "total_price" TYPE numeric(12,2)
    `);

    // Purchase Orders table
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" 
      ALTER COLUMN "subtotal" TYPE numeric(10,2),
      ALTER COLUMN "tax_amount" TYPE numeric(10,2),
      ALTER COLUMN "shipping_cost" TYPE numeric(10,2),
      ALTER COLUMN "total_amount" TYPE numeric(12,2)
    `);

    // Order Items table
    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ALTER COLUMN "unit_price" TYPE numeric(10,2),
      ALTER COLUMN "total_price" TYPE numeric(10,2),
      ALTER COLUMN "discount_amount" TYPE numeric(10,2),
      ALTER COLUMN "tax_amount" TYPE numeric(10,2)
    `);

    // Orders table
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ALTER COLUMN "subtotal" TYPE numeric(10,2),
      ALTER COLUMN "tax_amount" TYPE numeric(10,2),
      ALTER COLUMN "shipping_cost" TYPE numeric(10,2),
      ALTER COLUMN "discount_amount" TYPE numeric(10,2),
      ALTER COLUMN "total_amount" TYPE numeric(10,2),
      ALTER COLUMN "amount_paid" TYPE numeric(10,2),
      ALTER COLUMN "refund_amount" TYPE numeric(10,2)
    `);

    // Product Variants table
    await queryRunner.query(`
      ALTER TABLE "product_variants" 
      ALTER COLUMN "price" TYPE numeric(10,2),
      ALTER COLUMN "compare_at_price" TYPE numeric(10,2),
      ALTER COLUMN "cost_price" TYPE numeric(10,2)
    `);

    // Products table
    await queryRunner.query(`
      ALTER TABLE "products" 
      ALTER COLUMN "price" TYPE numeric(10,2),
      ALTER COLUMN "compareAtPrice" TYPE numeric(10,2)
    `);
  }
}
