import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMailProvidersTable1767000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mail_providers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
            comment: 'Unique name for the mail provider',
          },
          {
            name: 'provider_type',
            type: 'varchar',
            length: '100',
            default: "'smtp'",
            isNullable: false,
            comment: 'Provider type (smtp, sendgrid, mailgun, ses, postmark, mandrill, etc.)',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
            isNullable: true,
            comment: 'Description of the mail provider',
          },
          {
            name: 'smtp_host',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'SMTP server hostname (for SMTP providers)',
          },
          {
            name: 'smtp_port',
            type: 'int',
            isNullable: true,
            comment: 'SMTP server port',
          },
          {
            name: 'smtp_secure',
            type: 'boolean',
            default: true,
            isNullable: true,
            comment: 'Use TLS/SSL encryption',
          },
          {
            name: 'smtp_username',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'SMTP authentication username',
          },
          {
            name: 'smtp_password',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'SMTP authentication password (encrypted)',
          },
          {
            name: 'api_key',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'API key for service providers (sendgrid, mailgun, etc.)',
          },
          {
            name: 'api_secret',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'API secret for service providers',
          },
          {
            name: 'default_from_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Default sender email address',
          },
          {
            name: 'default_from_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Default sender display name',
          },
          {
            name: 'reply_to_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Reply-to email address',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Whether the mail provider is active',
          },
          {
            name: 'rate_limit',
            type: 'int',
            isNullable: true,
            comment: 'Maximum emails per hour (null = unlimited)',
          },
          {
            name: 'max_daily_limit',
            type: 'int',
            isNullable: true,
            comment: 'Maximum emails per day (null = unlimited)',
          },
          {
            name: 'priority',
            type: 'int',
            default: 5,
            isNullable: false,
            comment: 'Provider priority (1=highest, 10=lowest)',
          },
          {
            name: 'config',
            type: 'json',
            isNullable: true,
            comment: 'Provider-specific configuration',
          },
          {
            name: 'webhook_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Webhook URL for delivery notifications',
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
            name: 'version',
            type: 'int',
            default: 1,
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
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'mail_providers',
      new TableIndex({
        name: 'IDX_MAIL_PROVIDER_NAME',
        columnNames: ['name'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'mail_providers',
      new TableIndex({
        name: 'IDX_MAIL_PROVIDER_ACTIVE',
        columnNames: ['is_active'],
      })
    );

    await queryRunner.createIndex(
      'mail_providers',
      new TableIndex({
        name: 'IDX_MAIL_PROVIDER_TYPE',
        columnNames: ['provider_type'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mail_providers', true);
  }
}


