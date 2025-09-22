import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCountryIdToVarchar1758451762366 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Drop ALL foreign key constraints that reference these tables
        await queryRunner.query(`ALTER TABLE "administrative_divisions" DROP CONSTRAINT IF EXISTS "administrative_divisions_country_id_fkey";`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" DROP CONSTRAINT IF EXISTS "administrative_divisions_parent_id_fkey";`);

        // Step 2: Update both tables to use varchar for id columns
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "id" TYPE VARCHAR;`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ALTER COLUMN "id" TYPE VARCHAR;`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ALTER COLUMN "country_id" TYPE VARCHAR;`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ALTER COLUMN "parent_id" TYPE VARCHAR;`);

        // Step 3: Recreate the foreign key constraints
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ADD CONSTRAINT "administrative_divisions_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id");`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ADD CONSTRAINT "administrative_divisions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "administrative_divisions"("id");`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Drop the foreign key constraints
        await queryRunner.query(`ALTER TABLE "administrative_divisions" DROP CONSTRAINT IF EXISTS "administrative_divisions_country_id_fkey";`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" DROP CONSTRAINT IF EXISTS "administrative_divisions_parent_id_fkey";`);

        // Step 2: Revert the column types back to bigint
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ALTER COLUMN "country_id" TYPE BIGINT;`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ALTER COLUMN "parent_id" TYPE BIGINT;`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ALTER COLUMN "id" TYPE BIGINT;`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "id" TYPE BIGINT;`);

        // Step 3: Recreate the foreign key constraints with bigint types
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ADD CONSTRAINT "administrative_divisions_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id");`);
        await queryRunner.query(`ALTER TABLE "administrative_divisions" ADD CONSTRAINT "administrative_divisions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "administrative_divisions"("id");`);
    }

}
