import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedByToWarehouses1765100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "warehouses"
      ADD COLUMN "updated_by" uuid
    `);

    // Add foreign key constraint for updated_by if users table exists
    await queryRunner.query(`
      ALTER TABLE "warehouses"
      ADD CONSTRAINT "FK_warehouses_updated_by"
      FOREIGN KEY ("updated_by")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

    // Create index for updated_by for better performance
    await queryRunner.query(`CREATE INDEX "IDX_warehouses_updated_by" ON "warehouses" ("updated_by")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_warehouses_updated_by"`);
    await queryRunner.query(`ALTER TABLE "warehouses" DROP CONSTRAINT "FK_warehouses_updated_by"`);
    await queryRunner.query(`ALTER TABLE "warehouses" DROP COLUMN "updated_by"`);
  }
}