import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLevelToCategoriesTable1762000000000 implements MigrationInterface {
    name = 'AddLevelToCategoriesTable1762000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add level column to categories table
        await queryRunner.query(`
            ALTER TABLE "categories" 
            ADD COLUMN "level" integer NOT NULL DEFAULT 0
        `);

        // Create index for level for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_categories_level" ON "categories" ("level")
        `);

        // Update existing categories to calculate their correct level
        // We'll do this with a recursive CTE to calculate levels based on parent-child relationships
        await queryRunner.query(`
            WITH RECURSIVE category_hierarchy AS (
                -- Base case: root categories (no parent)
                SELECT id, parent_id, 0 as calculated_level
                FROM categories
                WHERE parent_id IS NULL
                
                UNION ALL
                
                -- Recursive case: children categories
                SELECT c.id, c.parent_id, ch.calculated_level + 1
                FROM categories c
                INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
            )
            UPDATE categories 
            SET level = category_hierarchy.calculated_level
            FROM category_hierarchy
            WHERE categories.id = category_hierarchy.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index first
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_level"`);
        
        // Remove the level column
        await queryRunner.query(`
            ALTER TABLE "categories" 
            DROP COLUMN "level"
        `);
    }
}