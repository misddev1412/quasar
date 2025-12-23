import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComponentConfigSectionsTable1770800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_component_configs_key_with_section"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_component_configs_key_without_section"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_configs_section_id"`);
    await queryRunner.query(`ALTER TABLE "component_configs" DROP CONSTRAINT IF EXISTS "FK_component_configs_section"`);
    await queryRunner.query(`ALTER TABLE "component_configs" DROP COLUMN IF EXISTS "section_id"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class c
          WHERE c.relname = 'component_configs_component_key_key'
        ) THEN
          ALTER TABLE "component_configs"
          ADD CONSTRAINT "component_configs_component_key_key" UNIQUE ("component_key");
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "component_config_sections" (
        "component_config_id" uuid NOT NULL REFERENCES "component_configs"("id") ON DELETE CASCADE,
        "section_id" uuid NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
        PRIMARY KEY ("component_config_id", "section_id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_component_config_sections_component"
      ON "component_config_sections" ("component_config_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_component_config_sections_section"
      ON "component_config_sections" ("section_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_config_sections_section"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_config_sections_component"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "component_config_sections"`);

    await queryRunner.query(`
      ALTER TABLE "component_configs"
      DROP CONSTRAINT IF EXISTS "component_configs_component_key_key";
    `);

    await queryRunner.query(`
      ALTER TABLE "component_configs"
      ADD COLUMN IF NOT EXISTS "section_id" uuid NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "component_configs"
      ADD CONSTRAINT "FK_component_configs_section"
      FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_component_configs_section_id"
      ON "component_configs" ("section_id");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_component_configs_key_without_section"
      ON "component_configs" ("component_key")
      WHERE section_id IS NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_component_configs_key_with_section"
      ON "component_configs" ("component_key", "section_id")
      WHERE section_id IS NOT NULL;
    `);
  }
}
