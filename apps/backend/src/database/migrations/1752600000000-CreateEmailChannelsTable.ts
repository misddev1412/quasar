import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateEmailChannelsTable1752600000000 implements MigrationInterface {
  name = 'CreateEmailChannelsTable1752600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_channels',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
            comment: 'Unique identifier for the email channel',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
            isNullable: true,
            comment: 'Description of the email channel purpose',
          },
          {
            name: 'smtp_host',
            type: 'varchar',
            length: '255',
            comment: 'SMTP server hostname',
          },
          {
            name: 'smtp_port',
            type: 'int',
            default: 587,
            comment: 'SMTP server port',
          },
          {
            name: 'smtp_secure',
            type: 'boolean',
            default: true,
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
            name: 'default_from_email',
            type: 'varchar',
            length: '255',
            comment: 'Default sender email address',
          },
          {
            name: 'default_from_name',
            type: 'varchar',
            length: '255',
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
            comment: 'Whether the email channel is active',
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
            comment: 'Whether this is the default email channel',
          },
          {
            name: 'rate_limit',
            type: 'int',
            default: 100,
            comment: 'Maximum emails per hour',
          },
          {
            name: 'provider_name',
            type: 'varchar',
            length: '100',
            default: "'smtp'",
            comment: 'Email provider type (smtp, sendgrid, mailgun, etc.)',
          },
          {
            name: 'priority',
            type: 'int',
            default: 5,
            comment: 'Channel priority (1=highest, 10=lowest)',
          },
          {
            name: 'usage_type',
            type: 'varchar',
            length: '50',
            default: "'general'",
            comment: 'Channel usage type (transactional, marketing, notification, general)',
          },
          {
            name: 'config_keys',
            type: 'json',
            isNullable: true,
            comment: 'Provider-specific configuration keys',
          },
          {
            name: 'advanced_config',
            type: 'json',
            isNullable: true,
            comment: 'Additional SMTP configuration options',
          },
          {
            name: 'max_daily_limit',
            type: 'int',
            isNullable: true,
            comment: 'Maximum emails per day (null = unlimited)',
          },
          {
            name: 'webhook_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Webhook URL for delivery notifications',
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance
    await queryRunner.createIndex(
      'email_channels',
      new TableIndex({ name: 'IDX_EMAIL_CHANNEL_NAME', columnNames: ['name'], isUnique: true })
    );

    await queryRunner.createIndex(
      'email_channels',
      new TableIndex({ name: 'IDX_EMAIL_CHANNEL_ACTIVE', columnNames: ['is_active'] })
    );

    await queryRunner.createIndex(
      'email_channels',
      new TableIndex({ name: 'IDX_EMAIL_CHANNEL_DEFAULT', columnNames: ['is_default'] })
    );

    await queryRunner.createIndex(
      'email_channels',
      new TableIndex({ name: 'IDX_EMAIL_CHANNEL_PRIORITY', columnNames: ['priority'] })
    );

    await queryRunner.createIndex(
      'email_channels',
      new TableIndex({ name: 'IDX_EMAIL_CHANNEL_PROVIDER', columnNames: ['provider_name'] })
    );

    await queryRunner.createIndex(
      'email_channels',
      new TableIndex({ name: 'IDX_EMAIL_CHANNEL_USAGE_TYPE', columnNames: ['usage_type'] })
    );

    // Insert default email channel
    await queryRunner.query(`
      INSERT INTO email_channels (
        id,
        name,
        description,
        smtp_host,
        smtp_port,
        smtp_secure,
        smtp_username,
        smtp_password,
        default_from_email,
        default_from_name,
        reply_to_email,
        is_active,
        is_default,
        rate_limit,
        provider_name,
        priority,
        usage_type,
        config_keys,
        advanced_config,
        max_daily_limit,
        webhook_url,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'Default SMTP Channel',
        'Default email channel for general purposes',
        'localhost',
        587,
        true,
        NULL,
        NULL,
        'noreply@example.com',
        'System',
        NULL,
        true,
        true,
        100,
        'smtp',
        5,
        'general',
        NULL,
        NULL,
        NULL,
        NULL,
        NOW(),
        NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('email_channels');
  }
}