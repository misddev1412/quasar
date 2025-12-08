import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedByColumnsToLoyaltyTables1765900000000 implements MigrationInterface {
  name = 'AddUpdatedByColumnsToLoyaltyTables1765900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add updated_by column to loyalty_tiers
    await queryRunner.query(`
      ALTER TABLE "loyalty_tiers"
      ADD COLUMN "updated_by" uuid
    `);

    // Add updated_by column to loyalty_rewards
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards"
      ADD COLUMN "updated_by" uuid
    `);

    // Add updated_by column to loyalty_transactions
    await queryRunner.query(`
      ALTER TABLE "loyalty_transactions"
      ADD COLUMN "updated_by" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_transactions"
      DROP COLUMN "updated_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards"
      DROP COLUMN "updated_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_tiers"
      DROP COLUMN "updated_by"
    `);
  }
}
