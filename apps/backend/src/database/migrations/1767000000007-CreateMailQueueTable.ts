import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMailQueueTable1767000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mail_queue');
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(new Table({
      name: 'mail_queue',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'gen_random_uuid()',
        },
        {
          name: 'email_flow_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'mail_template_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'mail_provider_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'recipient_email',
          type: 'varchar',
          length: '320',
          isNullable: false,
        },
        {
          name: 'recipient_name',
          type: 'varchar',
          length: '255',
          isNullable: true,
        },
        {
          name: 'subject',
          type: 'varchar',
          length: '255',
          isNullable: true,
        },
        {
          name: 'payload',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'metadata',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'priority',
          type: 'int',
          default: 5,
        },
        {
          name: 'status',
          type: 'varchar',
          length: '20',
          default: "'pending'",
        },
        {
          name: 'attempt_count',
          type: 'int',
          default: 0,
        },
        {
          name: 'scheduled_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'available_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'locked_at',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'locked_by',
          type: 'varchar',
          length: '100',
          isNullable: true,
        },
        {
          name: 'last_error',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
        },
      ],
    }));

    await queryRunner.createIndex('mail_queue', new TableIndex({
      name: 'IDX_MAIL_QUEUE_STATUS_PRIORITY',
      columnNames: ['status', 'priority'],
    }));

    await queryRunner.createIndex('mail_queue', new TableIndex({
      name: 'IDX_MAIL_QUEUE_SCHEDULED',
      columnNames: ['scheduled_at'],
    }));

    await queryRunner.createIndex('mail_queue', new TableIndex({
      name: 'IDX_MAIL_QUEUE_AVAILABLE',
      columnNames: ['available_at'],
    }));

    await queryRunner.createForeignKeys('mail_queue', [
      new TableForeignKey({
        columnNames: ['email_flow_id'],
        referencedTableName: 'mail_channel_priorities',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['mail_template_id'],
        referencedTableName: 'mail_templates',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['mail_provider_id'],
        referencedTableName: 'mail_providers',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mail_queue');
    if (!hasTable) {
      return;
    }
    await queryRunner.dropTable('mail_queue');
  }
}
