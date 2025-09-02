import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMailTemplateColumns1752450000000 implements MigrationInterface {
    name = 'AddMailTemplateColumns1752450000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists and add missing columns to mail_templates table
        const table = await queryRunner.getTable('mail_templates');
        if (!table) {
            throw new Error('mail_templates table does not exist');
        }

        const columnsToAdd = [];

        // Check each column and add only if it doesn't exist
        if (!table.findColumnByName('from_email')) {
            columnsToAdd.push(new TableColumn({
                name: 'from_email',
                type: 'varchar',
                length: '255',
                isNullable: true,
                comment: 'Sender email address for this template'
            }));
        }

        if (!table.findColumnByName('from_name')) {
            columnsToAdd.push(new TableColumn({
                name: 'from_name',
                type: 'varchar',
                length: '255',
                isNullable: true,
                comment: 'Sender display name for this template'
            }));
        }

        if (!table.findColumnByName('recipient_type')) {
            columnsToAdd.push(new TableColumn({
                name: 'recipient_type',
                type: 'varchar',
                length: '50',
                default: "'manual'",
                comment: 'Recipient type: manual, roles, all_users'
            }));
        }

        if (!table.findColumnByName('recipient_roles')) {
            columnsToAdd.push(new TableColumn({
                name: 'recipient_roles',
                type: 'text',
                isArray: true,
                default: "'{}'",
                isNullable: true,
                comment: 'Array of role IDs for role-based recipients'
            }));
        }

        if (!table.findColumnByName('email_channel_id')) {
            columnsToAdd.push(new TableColumn({
                name: 'email_channel_id',
                type: 'uuid',
                isNullable: true,
                comment: 'Email channel configuration to use for sending'
            }));
        }

        // Add only the columns that don't exist
        if (columnsToAdd.length > 0) {
            await queryRunner.addColumns('mail_templates', columnsToAdd);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists and drop columns only if they exist
        const table = await queryRunner.getTable('mail_templates');
        if (!table) {
            return; // Table doesn't exist, nothing to do
        }

        const columnsToDrop = [];
        
        // Check each column and add to drop list only if it exists
        const columnsToCheck = ['from_email', 'from_name', 'recipient_type', 'recipient_roles', 'email_channel_id'];
        
        for (const columnName of columnsToCheck) {
            if (table.findColumnByName(columnName)) {
                columnsToDrop.push(columnName);
            }
        }

        // Drop only the columns that exist
        if (columnsToDrop.length > 0) {
            await queryRunner.dropColumns('mail_templates', columnsToDrop);
        }
    }
}