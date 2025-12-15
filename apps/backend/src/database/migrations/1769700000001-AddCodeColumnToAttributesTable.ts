import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeColumnToAttributesTable1769700000001 implements MigrationInterface {
  name = 'AddCodeColumnToAttributesTable1769700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add code column to attributes table
    await queryRunner.query(`ALTER TABLE "attributes" ADD COLUMN "code" varchar(100) UNIQUE`);

    // Create index for better performance
    await queryRunner.query(`CREATE INDEX "IDX_attributes_code" ON "attributes" ("code")`);

    // Update existing attributes with generated codes
    await queryRunner.query(`
      UPDATE "attributes"
      SET "code" = LOWER(REPLACE(REPLACE(REPLACE("name", ' ', '_'), '-', '_'), '&', 'and'))
      WHERE "code" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_attributes_code"`);

    // Remove code column
    await queryRunner.query(`ALTER TABLE "attributes" DROP COLUMN "code"`);
  }
}