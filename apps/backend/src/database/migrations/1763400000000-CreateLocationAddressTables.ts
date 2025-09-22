import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocationAddressTables1763400000000 implements MigrationInterface {
    name = 'CreateLocationAddressTables1763400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create countries table
        await queryRunner.query(`
            CREATE TABLE "countries" (
                "id" bigint PRIMARY KEY,
                "name" text NOT NULL,
                "code" text NOT NULL,
                "iso2" character(2),
                "iso3" character(3),
                "phone_code" text,
                "latitude" numeric,
                "longitude" numeric,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "version" integer NOT NULL DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "UQ_countries_code" UNIQUE ("code"),
                CONSTRAINT "UQ_countries_iso2" UNIQUE ("iso2"),
                CONSTRAINT "UQ_countries_iso3" UNIQUE ("iso3")
            )
        `);

        // Create administrative_divisions table
        await queryRunner.query(`
            CREATE TABLE "administrative_divisions" (
                "id" bigint PRIMARY KEY,
                "country_id" bigint REFERENCES "countries"("id"),
                "parent_id" bigint REFERENCES "administrative_divisions"("id"),
                "name" text NOT NULL,
                "code" text,
                "type" text NOT NULL,
                "i18n_key" text NOT NULL,
                "latitude" numeric,
                "longitude" numeric,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "version" integer NOT NULL DEFAULT 1,
                "created_by" uuid,
                "updated_by" uuid
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_countries_code" ON "countries" ("code")`);
        await queryRunner.query(`CREATE INDEX "IDX_countries_iso2" ON "countries" ("iso2")`);
        await queryRunner.query(`CREATE INDEX "IDX_countries_iso3" ON "countries" ("iso3")`);
        await queryRunner.query(`CREATE INDEX "IDX_administrative_divisions_country" ON "administrative_divisions" ("country_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_administrative_divisions_parent" ON "administrative_divisions" ("parent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_administrative_divisions_type" ON "administrative_divisions" ("type")`);
        await queryRunner.query(`CREATE INDEX "IDX_administrative_divisions_i18n_key" ON "administrative_divisions" ("i18n_key")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key constraints
        await queryRunner.query(`DROP TABLE "administrative_divisions"`);
        await queryRunner.query(`DROP TABLE "countries"`);
    }
}