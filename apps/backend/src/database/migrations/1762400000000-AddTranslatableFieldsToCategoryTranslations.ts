import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTranslatableFieldsToCategoryTranslations1762400000000 implements MigrationInterface {
  name = 'AddTranslatableFieldsToCategoryTranslations1762400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add translatable fields to category_translations table
    await queryRunner.addColumns('category_translations', [
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

    // Migrate existing data from categories table to category_translations
    // First, get all categories with their translatable data
    const categories = await queryRunner.query(`
      SELECT id, name, description, slug, seo_title, seo_description, meta_keywords 
      FROM categories 
      WHERE name IS NOT NULL OR description IS NOT NULL OR slug IS NOT NULL 
         OR seo_title IS NOT NULL OR seo_description IS NOT NULL OR meta_keywords IS NOT NULL
    `);

    // Create translations for each category (default locale 'en')
    for (const category of categories) {
      // Check if translation already exists
      const existingTranslation = await queryRunner.query(`
        SELECT id FROM category_translations 
        WHERE category_id = $1 AND locale = 'en'
      `, [category.id]);

      if (existingTranslation.length === 0) {
        // Create new translation with all fields
        await queryRunner.query(`
          INSERT INTO category_translations (category_id, locale, name, description, slug, seo_title, seo_description, meta_keywords)
          VALUES ($1, 'en', $2, $3, $4, $5, $6, $7)
        `, [
          category.id,
          category.name,
          category.description,
          category.slug,
          category.seo_title,
          category.seo_description,
          category.meta_keywords
        ]);
      } else {
        // Update existing translation with new fields
        await queryRunner.query(`
          UPDATE category_translations 
          SET slug = $2, seo_title = $3, seo_description = $4, meta_keywords = $5
          WHERE category_id = $1 AND locale = 'en'
        `, [
          category.id,
          category.slug,
          category.seo_title,
          category.seo_description,
          category.meta_keywords
        ]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Before dropping columns, migrate data back to categories table
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

    // Drop the added columns
    await queryRunner.dropColumns('category_translations', [
      'slug',
      'seo_title',
      'seo_description',
      'meta_keywords'
    ]);
  }
}