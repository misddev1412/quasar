import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddApiHostToMailProvidersTable1767000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('mail_providers');
    
    if (table && !table.findColumnByName('api_host')) {
      await queryRunner.addColumn(
        'mail_providers',
        new TableColumn({
          name: 'api_host',
          type: 'varchar',
          length: '255',
          isNullable: true,
          comment: 'Custom API host for service providers (optional, uses default if not provided)',
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('mail_providers');
    
    if (table && table.findColumnByName('api_host')) {
      await queryRunner.dropColumn('mail_providers', 'api_host');
    }
  }
}

