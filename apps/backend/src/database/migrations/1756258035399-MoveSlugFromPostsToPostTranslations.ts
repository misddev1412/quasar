import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveSlugFromPostsToPostTranslations1756258035399 implements MigrationInterface {
    name = 'MoveSlugFromPostsToPostTranslations1756258035399';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add slug column to post_translations table
        await queryRunner.query(`
            ALTER TABLE post_translations 
            ADD COLUMN slug VARCHAR(255) NOT NULL DEFAULT ''
        `);

        // Create unique index on slug
        await queryRunner.query(`
            CREATE UNIQUE INDEX IDX_POST_TRANSLATION_SLUG 
            ON post_translations(slug)
        `);

        // Migrate existing slug data from posts to post_translations
        // For each post, copy the slug to all its translations
        await queryRunner.query(`
            UPDATE post_translations 
            SET slug = CONCAT(posts.slug, '-', post_translations.locale)
            FROM posts 
            WHERE post_translations.post_id = posts.id
        `);

        // Remove the slug column from posts table
        await queryRunner.query(`
            DROP INDEX IF EXISTS IDX_POSTS_SLUG
        `);
        
        await queryRunner.query(`
            ALTER TABLE posts 
            DROP COLUMN slug
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back slug column to posts table
        await queryRunner.query(`
            ALTER TABLE posts 
            ADD COLUMN slug VARCHAR(255)
        `);

        // Migrate slug data back from post_translations to posts
        // Use the first translation's slug (without locale suffix) as the post slug
        await queryRunner.query(`
            UPDATE posts 
            SET slug = REGEXP_REPLACE(pt.slug, '-[a-z]{2}$', '')
            FROM post_translations pt 
            WHERE posts.id = pt.post_id 
            AND pt.locale = (
                SELECT locale 
                FROM post_translations 
                WHERE post_id = posts.id 
                ORDER BY locale 
                LIMIT 1
            )
        `);

        // Make slug unique and not null
        await queryRunner.query(`
            ALTER TABLE posts 
            ALTER COLUMN slug SET NOT NULL
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IDX_POSTS_SLUG 
            ON posts(slug)
        `);

        // Remove slug column from post_translations
        await queryRunner.query(`
            DROP INDEX IF EXISTS IDX_POST_TRANSLATION_SLUG
        `);
        
        await queryRunner.query(`
            ALTER TABLE post_translations 
            DROP COLUMN slug
        `);
    }

}
