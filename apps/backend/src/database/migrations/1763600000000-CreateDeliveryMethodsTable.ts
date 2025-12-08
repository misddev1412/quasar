import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDeliveryMethodsTable1763600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'delivery_methods',
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
            type: 'enum',
            enum: [
              'STANDARD',
              'EXPRESS',
              'OVERNIGHT',
              'SAME_DAY',
              'PICKUP',
              'DIGITAL',
              'COURIER',
              'FREIGHT',
              'OTHER'
            ],
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'delivery_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'cost_calculation_type',
            type: 'enum',
            enum: ['FIXED', 'WEIGHT_BASED', 'DISTANCE_BASED', 'FREE'],
            default: "'FIXED'",
            isNullable: false,
          },
          {
            name: 'free_delivery_threshold',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'min_delivery_time_hours',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'max_delivery_time_hours',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'weight_limit_kg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'size_limit_cm',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Format: LxWxH in centimeters',
          },
          {
            name: 'coverage_areas',
            type: 'json',
            isNullable: true,
            comment: 'Array of supported postal codes, cities, or regions',
          },
          {
            name: 'supported_payment_methods',
            type: 'json',
            isNullable: true,
            comment: 'Array of payment method IDs that support this delivery method',
          },
          {
            name: 'provider_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'provider_api_config',
            type: 'json',
            isNullable: true,
            comment: 'Configuration for external delivery provider APIs',
          },
          {
            name: 'tracking_enabled',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'insurance_enabled',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'signature_required',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'icon_url',
            type: 'varchar',
            length: '512',
            isNullable: true,
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
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance
    await queryRunner.createIndex(
      'delivery_methods',
      new TableIndex({
        name: 'IDX_delivery_methods_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'delivery_methods',
      new TableIndex({
        name: 'IDX_delivery_methods_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'delivery_methods',
      new TableIndex({
        name: 'IDX_delivery_methods_default',
        columnNames: ['is_default'],
      }),
    );

    await queryRunner.createIndex(
      'delivery_methods',
      new TableIndex({
        name: 'IDX_delivery_methods_sort_order',
        columnNames: ['sort_order'],
      }),
    );

    await queryRunner.createIndex(
      'delivery_methods',
      new TableIndex({
        name: 'IDX_delivery_methods_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Insert some default delivery methods
    await queryRunner.query(`
      INSERT INTO delivery_methods (name, type, description, is_active, is_default, sort_order, delivery_cost, cost_calculation_type, min_delivery_time_hours, max_delivery_time_hours) VALUES
      ('Standard Delivery', 'STANDARD', 'Standard delivery within 3-5 business days', true, true, 1, 9.99, 'FIXED', 72, 120),
      ('Express Delivery', 'EXPRESS', 'Express delivery within 1-2 business days', true, false, 2, 19.99, 'FIXED', 24, 48),
      ('Overnight Delivery', 'OVERNIGHT', 'Next business day delivery', true, false, 3, 29.99, 'FIXED', 12, 24),
      ('Store Pickup', 'PICKUP', 'Pickup from our store location', true, false, 4, 0.00, 'FREE', 2, 24),
      ('Same Day Delivery', 'SAME_DAY', 'Same day delivery for orders placed before 2 PM', true, false, 5, 39.99, 'FIXED', 2, 8);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('delivery_methods');
  }
}