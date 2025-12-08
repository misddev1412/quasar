import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateMailTemplatesTable1752400000000 implements MigrationInterface {
    name = 'CreateMailTemplatesTable1752400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create mail_templates table
        await queryRunner.createTable(new Table({
            name: 'mail_templates',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '255',
                    isUnique: true,
                    isNullable: false,
                    comment: 'Unique identifier for the template'
                },
                {
                    name: 'subject',
                    type: 'varchar',
                    length: '500',
                    isNullable: false,
                    comment: 'Email subject line with support for variables'
                },
                {
                    name: 'body',
                    type: 'text',
                    isNullable: false,
                    comment: 'Email body content with support for variables/placeholders'
                },
                {
                    name: 'type',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                    comment: 'Template category/type (e.g., welcome, notification, marketing)'
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
                    comment: 'Whether template is enabled for use'
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                    comment: 'Optional description of the template purpose'
                },
                {
                    name: 'variables',
                    type: 'text',
                    isArray: true,
                    default: "'{}'",
                    isNullable: true,
                    comment: 'Array of available variables for this template'
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
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
                }
            ],
            indices: [
                {
                    name: 'IDX_MAIL_TEMPLATE_NAME',
                    columnNames: ['name'],
                    isUnique: true
                },
                {
                    name: 'IDX_MAIL_TEMPLATE_TYPE',
                    columnNames: ['type']
                },
                {
                    name: 'IDX_MAIL_TEMPLATE_ACTIVE',
                    columnNames: ['is_active']
                },
                {
                    name: 'IDX_MAIL_TEMPLATE_TYPE_ACTIVE',
                    columnNames: ['type', 'is_active']
                }
            ]
        }), true);

        // Insert some default mail templates
        await queryRunner.query(`
            INSERT INTO mail_templates (name, subject, body, type, description, variables) VALUES
            ('welcome_email', 'Welcome to {{app_name}}!', 
             '<h1>Welcome {{user_name}}!</h1><p>Thank you for joining {{app_name}}. We''re excited to have you on board.</p><p>Your account email: {{user_email}}</p><p>Best regards,<br>The {{app_name}} Team</p>',
             'user_onboarding', 'Welcome email sent to new users after registration',
             '{"user_name", "user_email", "app_name"}'
            ),
            ('password_reset', 'Reset Your Password - {{app_name}}',
             '<h1>Password Reset Request</h1><p>Hello {{user_name}},</p><p>You requested to reset your password. Click the link below to reset it:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>This link will expire in {{expiry_time}}.</p><p>If you didn''t request this, please ignore this email.</p>',
             'authentication', 'Password reset email with secure link',
             '{"user_name", "reset_link", "expiry_time", "app_name"}'
            ),
            ('account_verification', 'Verify Your Account - {{app_name}}',
             '<h1>Account Verification</h1><p>Hello {{user_name}},</p><p>Please verify your email address by clicking the link below:</p><p><a href="{{verification_link}}">Verify Account</a></p><p>This link will expire in {{expiry_time}}.</p>',
             'authentication', 'Email verification for new accounts',
             '{"user_name", "verification_link", "expiry_time", "app_name"}'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('mail_templates');
    }
}
