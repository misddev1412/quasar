import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByColumnsToLoyaltyTables1765800000000 implements MigrationInterface {
  name = 'AddCreatedByColumnsToLoyaltyTables1765800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add created_by column to loyalty_tiers
    await queryRunner.query(`
      ALTER TABLE "loyalty_tiers"
      ADD COLUMN "created_by" uuid
    `);

    // Add created_by column to loyalty_rewards
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards"
      ADD COLUMN "created_by" uuid
    `);

    // Add created_by column to loyalty_transactions
    await queryRunner.query(`
      ALTER TABLE "loyalty_transactions"
      ADD COLUMN "created_by" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_transactions"
      DROP COLUMN "created_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards"
      DROP COLUMN "created_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_tiers"
      DROP COLUMN "created_by"
    `);
  }
}
