import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionColumnsToLoyaltyTables1765700000000 implements MigrationInterface {
  name = 'AddVersionColumnsToLoyaltyTables1765700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add version column to loyalty_tiers
    await queryRunner.query(`
      ALTER TABLE "loyalty_tiers"
      ADD COLUMN "version" integer NOT NULL DEFAULT 1
    `);

    // Add version column to loyalty_rewards
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards"
      ADD COLUMN "version" integer NOT NULL DEFAULT 1
    `);

    // Add version column to loyalty_transactions
    await queryRunner.query(`
      ALTER TABLE "loyalty_transactions"
      ADD COLUMN "version" integer NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_transactions"
      DROP COLUMN "version"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards"
      DROP COLUMN "version"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_tiers"
      DROP COLUMN "version"
    `);
  }
}
