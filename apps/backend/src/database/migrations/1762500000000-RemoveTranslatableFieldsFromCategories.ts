import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveTranslatableFieldsFromCategories1762500000000 implements MigrationInterface {
  name = 'RemoveTranslatableFieldsFromCategories1762500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop unique constraint and index on slug if they exist
    try {
      await queryRunner.query(`ALTER TABLE categories DROP CONSTRAINT IF EXISTS "UQ_categories_slug"`);
    } catch (error) {
      // Constraint might not exist, ignore error
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_slug"`);
    } catch (error) {
      // Index might not exist, ignore error
    }

    // Remove translatable fields from categories table
    // Note: We keep 'name' in categories table as it's needed for fallback display
    await queryRunner.dropColumns('categories', [
      'slug',
      'seo_title', 
      'seo_description',
      'meta_keywords'
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the translatable fields to categories table
    await queryRunner.addColumns('categories', [
      new TableColumn({
        name: 'slug',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'seo_title',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'seo_description',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'meta_keywords',
        type: 'text',
        isNullable: true,
      }),
    ]);

    // Recreate unique index on slug
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_categories_slug" ON "categories" ("slug")`);

    // Migrate data back from category_translations to categories (en locale only)
    const translations = await queryRunner.query(`
      SELECT category_id, slug, seo_title, seo_description, meta_keywords
      FROM category_translations 
      WHERE locale = 'en' AND (slug IS NOT NULL OR seo_title IS NOT NULL OR seo_description IS NOT NULL OR meta_keywords IS NOT NULL)
    `);

    for (const translation of translations) {
      await queryRunner.query(`
        UPDATE categories 
        SET slug = $2, seo_title = $3, seo_description = $4, meta_keywords = $5
        WHERE id = $1
      `, [
        translation.category_id,
        translation.slug,
        translation.seo_title,
        translation.seo_description,
        translation.meta_keywords
      ]);
    }
  }
}