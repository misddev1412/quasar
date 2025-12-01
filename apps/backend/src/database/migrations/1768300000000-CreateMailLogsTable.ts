import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMailLogsTable1768300000000 implements MigrationInterface {
  name = 'CreateMailLogsTable1768300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'mail_logs',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'gen_random_uuid()',
        },
        {
          name: 'mail_provider_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'mail_template_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'email_flow_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'recipient',
          type: 'varchar',
          length: '320',
        },
        {
          name: 'cc',
          type: 'text',
          isArray: true,
          isNullable: true,
        },
        {
          name: 'bcc',
          type: 'text',
          isArray: true,
          isNullable: true,
        },
        {
          name: 'from_email',
          type: 'varchar',
          length: '320',
          isNullable: true,
        },
        {
          name: 'from_name',
          type: 'varchar',
          length: '255',
          isNullable: true,
        },
        {
          name: 'subject',
          type: 'varchar',
          length: '500',
          isNullable: true,
        },
        {
          name: 'body_preview',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'status',
          type: 'varchar',
          length: '50',
          default: `'queued'`,
        },
        {
          name: 'channel',
          type: 'varchar',
          length: '20',
          default: `'email'`,
        },
        {
          name: 'is_test',
          type: 'boolean',
          default: false,
        },
        {
          name: 'sent_at',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'provider_message_id',
          type: 'varchar',
          length: '255',
          isNullable: true,
        },
        {
          name: 'error_message',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'provider_response',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'metadata',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'request_payload',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'triggered_by',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'delivery_metadata',
          type: 'jsonb',
          isNullable: true,
        },
        // BaseEntity fields
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'version',
          type: 'int',
          default: 1,
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
    }));

    await queryRunner.createIndices('mail_logs', [
      new TableIndex({
        name: 'IDX_MAIL_LOG_STATUS',
        columnNames: ['status'],
      }),
      new TableIndex({
        name: 'IDX_MAIL_LOG_PROVIDER',
        columnNames: ['mail_provider_id'],
      }),
      new TableIndex({
        name: 'IDX_MAIL_LOG_TEMPLATE',
        columnNames: ['mail_template_id'],
      }),
      new TableIndex({
        name: 'IDX_MAIL_LOG_FLOW',
        columnNames: ['email_flow_id'],
      }),
      new TableIndex({
        name: 'IDX_MAIL_LOG_RECIPIENT',
        columnNames: ['recipient'],
      }),
      new TableIndex({
        name: 'IDX_MAIL_LOG_CREATED_AT',
        columnNames: ['created_at'],
      }),
      new TableIndex({
        name: 'IDX_MAIL_LOG_IS_TEST',
        columnNames: ['is_test'],
      }),
    ]);

    await queryRunner.createForeignKeys('mail_logs', [
      new TableForeignKey({
        columnNames: ['mail_provider_id'],
        referencedTableName: 'mail_providers',
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
        columnNames: ['email_flow_id'],
        referencedTableName: 'email_flows',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mail_logs');
  }
}
