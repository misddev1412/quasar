import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateNotificationEventFlows1769000000000 implements MigrationInterface {
  name = 'CreateNotificationEventFlows1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'notification_event_flows',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'gen_random_uuid()',
        },
        {
          name: 'event_key',
          type: 'varchar',
          length: '120',
          isNullable: false,
        },
        {
          name: 'display_name',
          type: 'varchar',
          length: '150',
          isNullable: false,
        },
        {
          name: 'description',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'channel_preferences',
          type: 'text',
          isArray: true,
          default: "'{}'",
        },
        {
          name: 'include_actor',
          type: 'boolean',
          default: true,
        },
        {
          name: 'recipient_user_ids',
          type: 'text',
          isArray: true,
          default: "'{}'",
        },
        {
          name: 'cc_user_ids',
          type: 'text',
          isArray: true,
          default: "'{}'",
        },
        {
          name: 'bcc_user_ids',
          type: 'text',
          isArray: true,
          default: "'{}'",
        },
        {
          name: 'cc_emails',
          type: 'text',
          isArray: true,
          isNullable: true,
          default: "'{}'",
        },
        {
          name: 'bcc_emails',
          type: 'text',
          isArray: true,
          isNullable: true,
          default: "'{}'",
        },
        {
          name: 'channel_metadata',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'is_active',
          type: 'boolean',
          default: true,
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

    await queryRunner.createIndex('notification_event_flows', new TableIndex({
      name: 'IDX_NOTIFICATION_EVENT_FLOW_EVENT_KEY',
      columnNames: ['event_key'],
      isUnique: true,
    }));

    await queryRunner.createTable(new Table({
      name: 'notification_event_flow_templates',
      columns: [
        {
          name: 'event_flow_id',
          type: 'uuid',
          isPrimary: true,
        },
        {
          name: 'mail_template_id',
          type: 'uuid',
          isPrimary: true,
        },
      ],
    }));

    await queryRunner.createForeignKey('notification_event_flow_templates', new TableForeignKey({
      columnNames: ['event_flow_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'notification_event_flows',
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('notification_event_flow_templates', new TableForeignKey({
      columnNames: ['mail_template_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'mail_templates',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('notification_event_flow_templates');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('notification_event_flow_templates', fk);
      }
    }
    await queryRunner.dropTable('notification_event_flow_templates');
    await queryRunner.dropIndex('notification_event_flows', 'IDX_NOTIFICATION_EVENT_FLOW_EVENT_KEY');
    await queryRunner.dropTable('notification_event_flows');
  }
}
