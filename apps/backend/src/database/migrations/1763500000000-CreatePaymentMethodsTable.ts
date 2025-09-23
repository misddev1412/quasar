import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePaymentMethodsTable1763500000000 implements MigrationInterface {
  name = 'CreatePaymentMethodsTable1763500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_methods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'processingFee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'processingFeeType',
            type: 'varchar',
            length: '20',
            default: "'FIXED'",
            isNullable: false,
          },
          {
            name: 'minAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'maxAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'supportedCurrencies',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'configuration',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'iconUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({ name: 'IDX_payment_methods_type', columnNames: ['type'] })
    );

    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({ name: 'IDX_payment_methods_is_active', columnNames: ['isActive'] })
    );

    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({ name: 'IDX_payment_methods_sort_order', columnNames: ['sortOrder'] })
    );

    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({ name: 'IDX_payment_methods_is_default', columnNames: ['isDefault'] })
    );

    // Insert default payment methods
    await queryRunner.query(`
      INSERT INTO payment_methods (name, type, description, "isActive", "sortOrder", "isDefault") VALUES
      ('Credit Card', 'CREDIT_CARD', 'Pay with credit card (Visa, Mastercard, American Express)', true, 1, true),
      ('Debit Card', 'DEBIT_CARD', 'Pay with debit card', true, 2, false),
      ('Bank Transfer', 'BANK_TRANSFER', 'Direct bank transfer', true, 3, false),
      ('PayPal', 'DIGITAL_WALLET', 'Pay with PayPal digital wallet', true, 4, false),
      ('Cash on Delivery', 'CASH', 'Pay with cash when delivered', true, 5, false)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_is_default');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_sort_order');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_is_active');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_methods_type');

    await queryRunner.dropTable('payment_methods');
  }
}