import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRolesCodeColumn1776000000000 implements MigrationInterface {
  name = 'UpdateRolesCodeColumn1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "roles"
      ALTER COLUMN "code"
      TYPE character varying(100)
      USING "code"::text
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "roles_code_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "roles_code_enum" AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'user', 'guest')
    `);

    await queryRunner.query(`
      ALTER TABLE "roles"
      ALTER COLUMN "code"
      TYPE "roles_code_enum"
      USING (
        CASE
          WHEN "code" IN ('super_admin', 'admin', 'manager', 'staff', 'user', 'guest')
            THEN "code"::"roles_code_enum"
          ELSE 'user'::"roles_code_enum"
        END
      )
    `);
  }
}
