import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEmailFlowsTable1767000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_flows',
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
            comment: 'Unique name for the email flow',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
            isNullable: true,
            comment: 'Description of the email flow',
          },
          {
            name: 'mail_provider_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Mail provider to use for this flow',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Whether the email flow is active',
          },
          {
            name: 'priority',
            type: 'int',
            default: 5,
            isNullable: true,
            comment: 'Flow priority (1=highest, 10=lowest)',
          },
          {
            name: 'config',
            type: 'json',
            isNullable: true,
            comment: 'Additional flow configuration',
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

    // Create foreign key
    await queryRunner.createForeignKey(
      'email_flows',
      new TableForeignKey({
        columnNames: ['mail_provider_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mail_providers',
        onDelete: 'RESTRICT',
        name: 'FK_EMAIL_FLOW_MAIL_PROVIDER',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'email_flows',
      new TableIndex({
        name: 'IDX_EMAIL_FLOW_NAME',
        columnNames: ['name'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'email_flows',
      new TableIndex({
        name: 'IDX_EMAIL_FLOW_ACTIVE',
        columnNames: ['is_active'],
      })
    );

    await queryRunner.createIndex(
      'email_flows',
      new TableIndex({
        name: 'IDX_EMAIL_FLOW_PROVIDER',
        columnNames: ['mail_provider_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('email_flows', true);
  }
}


