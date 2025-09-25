import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddThirdPartyIntegrationToDeliveryMethods1763700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('delivery_methods', new TableColumn({
      name: 'use_third_party_integration',
      type: 'boolean',
      default: false,
      isNullable: false,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('delivery_methods', 'use_third_party_integration');
  }
}