import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPaymentMethodsToSnakeCase1763500000001 implements MigrationInterface {
  name = 'ConvertPaymentMethodsToSnakeCase1763500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing indexes first
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_type');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_is_default');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_sort_order');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_is_active');

    // Rename camelCase columns to snake_case
    await queryRunner.renameColumn('payment_methods', 'isActive', 'is_active');
    await queryRunner.renameColumn('payment_methods', 'sortOrder', 'sort_order');
    await queryRunner.renameColumn('payment_methods', 'processingFee', 'processing_fee');
    await queryRunner.renameColumn('payment_methods', 'processingFeeType', 'processing_fee_type');
    await queryRunner.renameColumn('payment_methods', 'minAmount', 'min_amount');
    await queryRunner.renameColumn('payment_methods', 'maxAmount', 'max_amount');
    await queryRunner.renameColumn('payment_methods', 'supportedCurrencies', 'supported_currencies');
    await queryRunner.renameColumn('payment_methods', 'iconUrl', 'icon_url');
    await queryRunner.renameColumn('payment_methods', 'isDefault', 'is_default');
    await queryRunner.renameColumn('payment_methods', 'createdAt', 'created_at');
    await queryRunner.renameColumn('payment_methods', 'updatedAt', 'updated_at');
    await queryRunner.renameColumn('payment_methods', 'deletedAt', 'deleted_at');

    // Recreate indexes with new column names
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_type" ON "payment_methods" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_is_active" ON "payment_methods" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_sort_order" ON "payment_methods" ("sort_order")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_is_default" ON "payment_methods" ("is_default")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop snake_case indexes
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_is_default');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_sort_order');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_is_active');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_type');

    // Rename snake_case columns back to camelCase
    await queryRunner.renameColumn('payment_methods', 'is_active', 'isActive');
    await queryRunner.renameColumn('payment_methods', 'sort_order', 'sortOrder');
    await queryRunner.renameColumn('payment_methods', 'processing_fee', 'processingFee');
    await queryRunner.renameColumn('payment_methods', 'processing_fee_type', 'processingFeeType');
    await queryRunner.renameColumn('payment_methods', 'min_amount', 'minAmount');
    await queryRunner.renameColumn('payment_methods', 'max_amount', 'maxAmount');
    await queryRunner.renameColumn('payment_methods', 'supported_currencies', 'supportedCurrencies');
    await queryRunner.renameColumn('payment_methods', 'icon_url', 'iconUrl');
    await queryRunner.renameColumn('payment_methods', 'is_default', 'isDefault');
    await queryRunner.renameColumn('payment_methods', 'created_at', 'createdAt');
    await queryRunner.renameColumn('payment_methods', 'updated_at', 'updatedAt');
    await queryRunner.renameColumn('payment_methods', 'deleted_at', 'deletedAt');

    // Recreate camelCase indexes
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_type" ON "payment_methods" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_is_active" ON "payment_methods" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_sort_order" ON "payment_methods" ("sortOrder")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_is_default" ON "payment_methods" ("isDefault")`);
  }
}