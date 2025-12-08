const { MigrationInterface, QueryRunner } = require('typeorm');

class AddSlugToCategoriesTable1761000000000 {
    name = 'AddSlugToCategoriesTable1761000000000';

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "categories" 
            ADD COLUMN "slug" character varying(255)
        `);

        // Add unique constraint
        await queryRunner.query(`
            ALTER TABLE "categories" 
            ADD CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
        `);

        // Create index for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_categories_slug" ON "categories" ("slug")
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_categories_slug"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_categories_slug"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
    }
}

module.exports = { AddSlugToCategoriesTable1761000000000 };