import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLanguagesTable1753000000000 implements MigrationInterface {
  name = 'CreateLanguagesTable1753000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create languages table
    await queryRunner.createTable(
      new Table({
        name: 'languages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '10',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'nativeName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'languages',
      new TableIndex({
        name: 'IDX_LANGUAGE_CODE',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'languages',
      new TableIndex({
        name: 'IDX_LANGUAGE_ACTIVE',
        columnNames: ['isActive'],
      }),
    );

    await queryRunner.createIndex(
      'languages',
      new TableIndex({
        name: 'IDX_LANGUAGE_DEFAULT',
        columnNames: ['isDefault'],
      }),
    );

    await queryRunner.createIndex(
      'languages',
      new TableIndex({
        name: 'IDX_LANGUAGE_SORT_ORDER',
        columnNames: ['sortOrder'],
      }),
    );

    // Insert initial language data
    await queryRunner.query(`
      INSERT INTO languages (code, name, "nativeName", icon, "isActive", "isDefault", "sortOrder") VALUES
      ('en', 'English', 'English', '🇺🇸', true, true, 1),
      ('vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳', true, false, 2),
      ('fr', 'French', 'Français', '🇫🇷', false, false, 3),
      ('de', 'German', 'Deutsch', '🇩🇪', false, false, 4),
      ('es', 'Spanish', 'Español', '🇪🇸', false, false, 5),
      ('it', 'Italian', 'Italiano', '🇮🇹', false, false, 6),
      ('pt', 'Portuguese', 'Português', '🇵🇹', false, false, 7),
      ('ja', 'Japanese', '日本語', '🇯🇵', false, false, 8),
      ('ko', 'Korean', '한국어', '🇰🇷', false, false, 9),
      ('zh', 'Chinese', '中文', '🇨🇳', false, false, 10),
      ('ru', 'Russian', 'Русский', '🇷🇺', false, false, 11),
      ('ar', 'Arabic', 'العربية', '🇸🇦', false, false, 12),
      ('hi', 'Hindi', 'हिन्दी', '🇮🇳', false, false, 13),
      ('th', 'Thai', 'ไทย', '🇹🇭', false, false, 14),
      ('id', 'Indonesian', 'Bahasa Indonesia', '🇮🇩', false, false, 15);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('languages', 'IDX_LANGUAGE_SORT_ORDER');
    await queryRunner.dropIndex('languages', 'IDX_LANGUAGE_DEFAULT');
    await queryRunner.dropIndex('languages', 'IDX_LANGUAGE_ACTIVE');
    await queryRunner.dropIndex('languages', 'IDX_LANGUAGE_CODE');

    // Drop table
    await queryRunner.dropTable('languages');
  }
}