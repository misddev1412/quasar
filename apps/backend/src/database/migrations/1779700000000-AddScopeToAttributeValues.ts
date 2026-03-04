import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScopeToAttributeValues1779700000000 implements MigrationInterface {
  name = 'AddScopeToAttributeValues1779700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attribute_values"
      ADD COLUMN IF NOT EXISTS "scope" character varying(10) NOT NULL DEFAULT 'GLOBAL'
    `);

    await queryRunner.query(`
      ALTER TABLE "attribute_values"
      DROP CONSTRAINT IF EXISTS "CHK_attribute_values_scope"
    `);

    await queryRunner.query(`
      ALTER TABLE "attribute_values"
      ADD CONSTRAINT "CHK_attribute_values_scope" CHECK ("scope" IN ('LOCAL', 'GLOBAL'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attribute_values"
      DROP CONSTRAINT IF EXISTS "CHK_attribute_values_scope"
    `);

    await queryRunner.query(`
      ALTER TABLE "attribute_values"
      DROP COLUMN IF EXISTS "scope"
    `);
  }
}
