import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreateSiteContentsTable1765600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "site_content_category_enum" AS ENUM (
          'policy',
          'guide',
          'about',
          'faq',
          'information'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "site_content_status_enum" AS ENUM (
          'draft',
          'published',
          'archived'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'site_contents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'category',
            type: 'site_content_category_enum',
            default: "'information'",
          },
          {
            name: 'status',
            type: 'site_content_status_enum',
            default: "'draft'",
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'language_code',
            type: 'varchar',
            length: '10',
            default: "'vi'",
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_featured',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'site_contents',
      new TableUnique({ name: 'UQ_site_contents_code', columnNames: ['code'] }),
    );

    await queryRunner.createUniqueConstraint(
      'site_contents',
      new TableUnique({ name: 'UQ_site_contents_slug', columnNames: ['slug'] }),
    );

    await queryRunner.createIndex(
      'site_contents',
      new TableIndex({ name: 'IDX_site_contents_category', columnNames: ['category'] }),
    );

    await queryRunner.createIndex(
      'site_contents',
      new TableIndex({ name: 'IDX_site_contents_status', columnNames: ['status'] }),
    );

    await queryRunner.createIndex(
      'site_contents',
      new TableIndex({ name: 'IDX_site_contents_language_code', columnNames: ['language_code'] }),
    );

    await queryRunner.createIndex(
      'site_contents',
      new TableIndex({ name: 'IDX_site_contents_is_featured', columnNames: ['is_featured'] }),
    );

    await queryRunner.createIndex(
      'site_contents',
      new TableIndex({ name: 'IDX_site_contents_display_order', columnNames: ['display_order'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('site_contents', 'IDX_site_contents_display_order');
    await queryRunner.dropIndex('site_contents', 'IDX_site_contents_is_featured');
    await queryRunner.dropIndex('site_contents', 'IDX_site_contents_language_code');
    await queryRunner.dropIndex('site_contents', 'IDX_site_contents_status');
    await queryRunner.dropIndex('site_contents', 'IDX_site_contents_category');

    await queryRunner.dropUniqueConstraint('site_contents', 'UQ_site_contents_slug');
    await queryRunner.dropUniqueConstraint('site_contents', 'UQ_site_contents_code');

    await queryRunner.dropTable('site_contents');

    await queryRunner.query('DROP TYPE IF EXISTS "site_content_status_enum";');
    await queryRunner.query('DROP TYPE IF EXISTS "site_content_category_enum";');
  }
}
