import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateVisitorAnalyticsTables1763881457766 implements MigrationInterface {
  name = 'CreateVisitorAnalyticsTables1763881457766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create visitors table
    await queryRunner.createTable(
      new Table({
        name: 'visitors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'visitor_id',
            type: 'varchar',
            length: '255',
            isUnique: true,
            comment: 'Unique identifier for tracking across sessions'
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true
          },
          {
            name: 'visitor_type',
            type: 'enum',
            enum: ['new', 'returning'],
            default: "'new'"
          },
          {
            name: 'visitor_source',
            type: 'enum',
            enum: ['direct', 'search_engine', 'social_media', 'referral', 'email', 'paid_advertising', 'organic', 'other'],
            isNullable: true
          },
          {
            name: 'referrer_url',
            type: 'text',
            isNullable: true
          },
          {
            name: 'landing_page',
            type: 'text',
            isNullable: true
          },
          {
            name: 'utm_source',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'utm_medium',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'utm_campaign',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'utm_term',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'utm_content',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'country_code',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'device_type',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'browser_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'browser_version',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'os_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'os_version',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'version',
            type: 'integer',
            default: 1
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Create visitor sessions table
    await queryRunner.createTable(
      new Table({
        name: 'visitor_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'visitor_id',
            type: 'uuid'
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isUnique: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'expired', 'completed'],
            default: "'active'"
          },
          {
            name: 'start_time',
            type: 'timestamp'
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'duration_seconds',
            type: 'integer',
            isNullable: true
          },
          {
            name: 'page_views_count',
            type: 'integer',
            default: 0
          },
          {
            name: 'bounce_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true
          },
          {
            name: 'device_type',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'browser_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'browser_version',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'os_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'os_version',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'country_code',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'version',
            type: 'integer',
            default: 1
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Create page views table
    await queryRunner.createTable(
      new Table({
        name: 'page_views',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'session_id',
            type: 'uuid'
          },
          {
            name: 'page_url',
            type: 'text'
          },
          {
            name: 'page_title',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'page_type',
            type: 'enum',
            enum: ['page_view', 'product_view', 'category_view', 'search_view', 'checkout_view', 'cart_view', 'blog_view', 'other'],
            default: "'page_view'"
          },
          {
            name: 'resource_id',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'resource_type',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'referrer_url',
            type: 'text',
            isNullable: true
          },
          {
            name: 'search_query',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'time_on_page_seconds',
            type: 'integer',
            isNullable: true
          },
          {
            name: 'viewport_width',
            type: 'integer',
            isNullable: true
          },
          {
            name: 'viewport_height',
            type: 'integer',
            isNullable: true
          },
          {
            name: 'scroll_depth_percent',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'version',
            type: 'integer',
            default: 1
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Create foreign key constraints
    await queryRunner.createForeignKey('visitor_sessions', new TableForeignKey({
      columnNames: ['visitor_id'],
      referencedTableName: 'visitors',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }));

    await queryRunner.createForeignKey('page_views', new TableForeignKey({
      columnNames: ['session_id'],
      referencedTableName: 'visitor_sessions',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }));

    // Create indexes for performance
    await queryRunner.createIndex('visitors', new TableIndex({
      name: 'IDX_visitors_visitor_id',
      columnNames: ['visitor_id']
    }));

    await queryRunner.createIndex('visitors', new TableIndex({
      name: 'IDX_visitors_ip_address',
      columnNames: ['ip_address']
    }));

    await queryRunner.createIndex('visitors', new TableIndex({
      name: 'IDX_visitors_visitor_source',
      columnNames: ['visitor_source']
    }));

    await queryRunner.createIndex('visitors', new TableIndex({
      name: 'IDX_visitors_created_at',
      columnNames: ['created_at']
    }));

    await queryRunner.createIndex('visitor_sessions', new TableIndex({
      name: 'IDX_visitor_sessions_visitor_id',
      columnNames: ['visitor_id']
    }));

    await queryRunner.createIndex('visitor_sessions', new TableIndex({
      name: 'IDX_visitor_sessions_session_id',
      columnNames: ['session_id']
    }));

    await queryRunner.createIndex('visitor_sessions', new TableIndex({
      name: 'IDX_visitor_sessions_status',
      columnNames: ['status']
    }));

    await queryRunner.createIndex('visitor_sessions', new TableIndex({
      name: 'IDX_visitor_sessions_created_at',
      columnNames: ['created_at']
    }));

    await queryRunner.createIndex('page_views', new TableIndex({
      name: 'IDX_page_views_session_id',
      columnNames: ['session_id']
    }));

    await queryRunner.createIndex('page_views', new TableIndex({
      name: 'IDX_page_views_page_url',
      columnNames: ['page_url']
    }));

    await queryRunner.createIndex('page_views', new TableIndex({
      name: 'IDX_page_views_page_type',
      columnNames: ['page_type']
    }));

    await queryRunner.createIndex('page_views', new TableIndex({
      name: 'IDX_page_views_created_at',
      columnNames: ['created_at']
    }));

    await queryRunner.createIndex('page_views', new TableIndex({
      name: 'IDX_page_views_resource',
      columnNames: ['resource_type', 'resource_id']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables (indexes will be automatically dropped by TypeORM)
    await queryRunner.dropTable('page_views');
    await queryRunner.dropTable('visitor_sessions');
    await queryRunner.dropTable('visitors');
  }
}
