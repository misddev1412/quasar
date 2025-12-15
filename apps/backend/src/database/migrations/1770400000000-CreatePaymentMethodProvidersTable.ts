import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePaymentMethodProvidersTable1770400000000 implements MigrationInterface {
  name = 'CreatePaymentMethodProvidersTable1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment_methods" DROP COLUMN IF EXISTS "configuration"`);

    await queryRunner.createTable(
      new Table({
        name: 'payment_method_providers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'payment_method_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'provider_key',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Unique identifier such as PAYOS, STRIPE, etc.',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'provider_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
            default: "'PAYMENT_GATEWAY'",
            comment: 'gateway, bank_transfer_switch, wallet, etc.',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'environment',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'production'",
            comment: 'production, sandbox, staging, etc.',
          },
          {
            name: 'api_key',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'api_secret',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'client_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'client_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'checksum_key',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Signature or checksum key used by providers like PayOS',
          },
          {
            name: 'public_key',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'webhook_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'webhook_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'callback_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'credentials',
            type: 'jsonb',
            isNullable: true,
            comment: 'Encrypted credential payload stored by application service',
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
            comment: 'Provider specific toggles or metadata',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_payment_method_providers_payment_method',
            columnNames: ['payment_method_id'],
            referencedTableName: 'payment_methods',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'payment_method_providers',
      new TableIndex({
        name: 'IDX_payment_method_providers_payment_method_id',
        columnNames: ['payment_method_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment_method_providers',
      new TableIndex({
        name: 'IDX_payment_method_providers_provider_key',
        columnNames: ['provider_key'],
      }),
    );

    await queryRunner.createIndex(
      'payment_method_providers',
      new TableIndex({
        name: 'IDX_payment_method_providers_provider_type',
        columnNames: ['provider_type'],
      }),
    );

    await queryRunner.createIndex(
      'payment_method_providers',
      new TableIndex({
        name: 'IDX_payment_method_providers_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'payment_method_providers',
      new TableIndex({
        name: 'IDX_payment_method_providers_environment',
        columnNames: ['environment'],
      }),
    );

    await queryRunner.createIndex(
      'payment_method_providers',
      new TableIndex({
        name: 'UQ_payment_method_providers_method_id',
        columnNames: ['payment_method_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('payment_method_providers', 'UQ_payment_method_providers_method_id');
    await queryRunner.dropIndex('payment_method_providers', 'IDX_payment_method_providers_environment');
    await queryRunner.dropIndex('payment_method_providers', 'IDX_payment_method_providers_is_active');
    await queryRunner.dropIndex('payment_method_providers', 'IDX_payment_method_providers_provider_type');
    await queryRunner.dropIndex('payment_method_providers', 'IDX_payment_method_providers_provider_key');
    await queryRunner.dropIndex('payment_method_providers', 'IDX_payment_method_providers_payment_method_id');
    await queryRunner.dropTable('payment_method_providers');

    await queryRunner.query(`ALTER TABLE "payment_methods" ADD COLUMN "configuration" json`);
  }
}
