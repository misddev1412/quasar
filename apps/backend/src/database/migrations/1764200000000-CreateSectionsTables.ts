import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateSectionsTables1764200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "section_type_enum" AS ENUM (
          'hero_slider',
          'featured_products',
          'products_by_category',
          'news',
          'custom_html'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'sections',
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
            name: 'page',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'section_type_enum',
          },
          {
            name: 'position',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'config',
            type: 'jsonb',
            default: "'{}'::jsonb",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'sections',
      new TableIndex({ name: 'IDX_sections_page', columnNames: ['page'] })
    );

    await queryRunner.createIndex(
      'sections',
      new TableIndex({ name: 'IDX_sections_page_position', columnNames: ['page', 'position'] })
    );

    await queryRunner.createIndex(
      'sections',
      new TableIndex({ name: 'IDX_sections_is_enabled', columnNames: ['is_enabled'] })
    );

    await queryRunner.createTable(
      new Table({
        name: 'section_translations',
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
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'section_id',
            type: 'uuid',
          },
          {
            name: 'locale',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'subtitle',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'config_override',
            type: 'jsonb',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'section_translations',
      new TableUnique({
        name: 'UQ_section_translations_section_locale',
        columnNames: ['section_id', 'locale'],
      }),
    );

    await queryRunner.createForeignKey(
      'section_translations',
      new TableForeignKey({
        columnNames: ['section_id'],
        referencedTableName: 'sections',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'section_translations',
      new TableIndex({ name: 'IDX_section_translations_section', columnNames: ['section_id'] })
    );

    await queryRunner.createIndex(
      'section_translations',
      new TableIndex({ name: 'IDX_section_translations_locale', columnNames: ['locale'] })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('section_translations', 'IDX_section_translations_locale');
    await queryRunner.dropIndex('section_translations', 'IDX_section_translations_section');

    const sectionTranslationsTable = await queryRunner.getTable('section_translations');
    const foreignKey = sectionTranslationsTable?.foreignKeys.find((fk) => fk.columnNames.includes('section_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('section_translations', foreignKey);
    }

    await queryRunner.dropUniqueConstraint('section_translations', 'UQ_section_translations_section_locale');
    await queryRunner.dropTable('section_translations');

    await queryRunner.dropIndex('sections', 'IDX_sections_is_enabled');
    await queryRunner.dropIndex('sections', 'IDX_sections_page_position');
    await queryRunner.dropIndex('sections', 'IDX_sections_page');
    await queryRunner.dropTable('sections');

    await queryRunner.query('DROP TYPE IF EXISTS "section_type_enum"');
  }
}
