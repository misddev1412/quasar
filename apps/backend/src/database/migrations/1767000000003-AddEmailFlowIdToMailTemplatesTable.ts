import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddEmailFlowIdToMailTemplatesTable1767000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add email_flow_id column (nullable first to allow existing records)
    await queryRunner.addColumn(
      'mail_templates',
      new TableColumn({
        name: 'email_flow_id',
        type: 'uuid',
        isNullable: true, // Start as nullable for existing records
        comment: 'Email flow to use for sending (required)',
      })
    );

    // Create index
    await queryRunner.createIndex(
      'mail_templates',
      new TableIndex({
        name: 'IDX_MAIL_TEMPLATE_EMAIL_FLOW',
        columnNames: ['email_flow_id'],
      })
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'mail_templates',
      new TableForeignKey({
        columnNames: ['email_flow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'email_flows',
        onDelete: 'RESTRICT',
        name: 'FK_MAIL_TEMPLATE_EMAIL_FLOW',
      })
    );

    // Note: We keep email_flow_id as nullable for now to allow existing templates
    // In a future migration, you can make it required after ensuring all templates have flows
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('mail_templates', 'FK_MAIL_TEMPLATE_EMAIL_FLOW');

    // Drop index
    await queryRunner.dropIndex('mail_templates', 'IDX_MAIL_TEMPLATE_EMAIL_FLOW');

    // Drop column
    await queryRunner.dropColumn('mail_templates', 'email_flow_id');
  }
}


