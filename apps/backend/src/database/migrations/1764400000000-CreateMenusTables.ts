import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenusTables1764400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create menus table
    await queryRunner.query(`
      CREATE TABLE "menus" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "menu_group" varchar(100) NOT NULL,
        "type" varchar(50) NOT NULL,
        "url" varchar(255),
        "reference_id" varchar(255),
        "target" varchar(20) NOT NULL DEFAULT '_self',
        "position" integer NOT NULL DEFAULT 0,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "icon" varchar(100),
        "text_color" varchar(20),
        "background_color" varchar(20),
        "config" jsonb NOT NULL DEFAULT '{}',
        "is_mega_menu" boolean NOT NULL DEFAULT false,
        "mega_menu_columns" integer,
        "parent_id" uuid REFERENCES "menus"("id") ON DELETE CASCADE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        "deleted_by" uuid,
        "version" integer NOT NULL DEFAULT 1
      );
    `);

    // Create menu_translations table
    await queryRunner.query(`
      CREATE TABLE "menu_translations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "menu_id" uuid NOT NULL REFERENCES "menus"("id") ON DELETE CASCADE,
        "locale" varchar(10) NOT NULL,
        "label" varchar(255),
        "description" text,
        "custom_html" text,
        "config" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        UNIQUE("menu_id", "locale")
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_menus_menu_group_position" ON "menus"("menu_group", "position");
      CREATE INDEX "IDX_menus_parent_id" ON "menus"("parent_id");
      CREATE INDEX "IDX_menus_is_enabled" ON "menus"("is_enabled");
      CREATE INDEX "IDX_menu_translations_menu_id_locale" ON "menu_translations"("menu_id", "locale");
    `);

    // Create closure table for tree structure
    await queryRunner.query(`
      CREATE TABLE "menus_closure" (
        "id_ancestor" uuid NOT NULL REFERENCES "menus"("id") ON DELETE CASCADE,
        "id_descendant" uuid NOT NULL REFERENCES "menus"("id") ON DELETE CASCADE,
        "depth" integer NOT NULL DEFAULT 0,
        PRIMARY KEY("id_ancestor", "id_descendant")
      );
    `);

    // Create indexes for closure table
    await queryRunner.query(`
      CREATE INDEX "IDX_menus_closure_ancestor" ON "menus_closure"("id_ancestor");
      CREATE INDEX "IDX_menus_closure_descendant" ON "menus_closure"("id_descendant");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop closure table
    await queryRunner.query(`DROP TABLE IF EXISTS "menus_closure"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_translations_menu_id_locale"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menus_is_enabled"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menus_parent_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menus_menu_group_position"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_translations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menus"`);
  }
}
