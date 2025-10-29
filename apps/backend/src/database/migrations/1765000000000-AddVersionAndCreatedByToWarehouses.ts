import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionAndCreatedByToWarehouses1765000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "warehouses"
      ADD COLUMN "version" integer NOT NULL DEFAULT 1
    `);

    await queryRunner.query(`
      ALTER TABLE "warehouses"
      ADD COLUMN "created_by" uuid
    `);

    // Add foreign key constraint for created_by if users table exists
    await queryRunner.query(`
      ALTER TABLE "warehouses"
      ADD CONSTRAINT "FK_warehouses_created_by"
      FOREIGN KEY ("created_by")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

    // Create index for created_by for better performance
    await queryRunner.query(`CREATE INDEX "IDX_warehouses_created_by" ON "warehouses" ("created_by")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_warehouses_created_by"`);
    await queryRunner.query(`ALTER TABLE "warehouses" DROP CONSTRAINT "FK_warehouses_created_by"`);
    await queryRunner.query(`ALTER TABLE "warehouses" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "warehouses" DROP COLUMN "version"`);
  }
}