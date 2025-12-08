import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComponentConfigsTable1769600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "component_structure_type_enum" AS ENUM ('composite', 'atomic');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "component_category_enum" AS ENUM ('product', 'layout', 'marketing', 'content', 'action');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "component_configs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP NULL,
        "created_by" uuid NULL,
        "updated_by" uuid NULL,
        "deleted_by" uuid NULL,
        "version" INT NOT NULL DEFAULT 1,
        "component_key" VARCHAR(150) NOT NULL UNIQUE,
        "display_name" VARCHAR(255) NOT NULL,
        "description" TEXT NULL,
        "component_type" component_structure_type_enum NOT NULL,
        "category" component_category_enum NOT NULL DEFAULT 'product',
        "position" INT NOT NULL DEFAULT 0,
        "is_enabled" BOOLEAN NOT NULL DEFAULT true,
        "default_config" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "config_schema" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "allowed_child_keys" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "preview_media_url" VARCHAR(500),
        "parent_id" uuid NULL REFERENCES "component_configs"("id") ON DELETE SET NULL,
        "slot_key" VARCHAR(100)
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_component_configs_parent_id" ON "component_configs" ("parent_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_component_configs_category" ON "component_configs" ("category")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_component_configs_component_type" ON "component_configs" ("component_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_component_configs_is_enabled" ON "component_configs" ("is_enabled")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_configs_is_enabled"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_configs_component_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_configs_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_component_configs_parent_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "component_configs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "component_structure_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "component_category_enum"`);
  }
}
