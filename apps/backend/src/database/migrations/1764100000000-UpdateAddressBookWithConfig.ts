import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAddressBookWithConfig1764100000000 implements MigrationInterface {
  name = 'UpdateAddressBookWithConfig1764100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if address_book_config table exists, if not create it
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'address_book_config'
      );
    `);

    if (!tableExists[0].exists) {
      // Create address_book_config table
      await queryRunner.query(`
        CREATE TABLE address_book_config (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          country_id VARCHAR(255) NOT NULL,
          config_key VARCHAR(100) NOT NULL CHECK (config_key IN ('REQUIRE_POSTAL_CODE', 'REQUIRE_PHONE', 'REQUIRE_COMPANY', 'ALLOW_ADDRESS_LINE_2', 'REQUIRE_DELIVERY_INSTRUCTIONS', 'MAX_ADDRESS_BOOK_ENTRIES', 'DEFAULT_ADDRESS_TYPE', 'REQUIRE_ADMINISTRATIVE_DIVISIONS')),
          config_value TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          deleted_at TIMESTAMP,
          CONSTRAINT uk_address_book_config_country_key UNIQUE (country_id, config_key)
        );
      `);

      // Create indexes for address_book_config
      await queryRunner.query(`CREATE INDEX idx_address_book_config_country_id ON address_book_config(country_id);`);
      await queryRunner.query(`CREATE INDEX idx_address_book_config_config_key ON address_book_config(config_key);`);
      await queryRunner.query(`CREATE INDEX idx_address_book_config_is_active ON address_book_config(is_active);`);
      await queryRunner.query(`CREATE INDEX idx_address_book_config_created_at ON address_book_config(created_at);`);
      await queryRunner.query(`CREATE INDEX idx_address_book_config_deleted_at ON address_book_config(deleted_at);`);
    }

    // Check if config_id column exists in address_book table
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'address_book'
        AND column_name = 'config_id'
      );
    `);

    if (!columnExists[0].exists) {
      // Add config_id column to address_book table
      await queryRunner.query(`
        ALTER TABLE address_book
        ADD COLUMN config_id uuid,
        ADD CONSTRAINT fk_address_book_config
        FOREIGN KEY (config_id)
        REFERENCES address_book_config(id)
        ON DELETE SET NULL;
      `);

      // Create index for address_book config_id
      await queryRunner.query(`CREATE INDEX idx_address_book_config_id ON address_book(config_id);`);
    }

    // Insert default configurations for existing countries
    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'REQUIRE_POSTAL_CODE',
        'FALSE',
        'Whether postal code is required for addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'REQUIRE_POSTAL_CODE'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'REQUIRE_PHONE',
        'FALSE',
        'Whether phone number is required for addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'REQUIRE_PHONE'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'REQUIRE_COMPANY',
        'FALSE',
        'Whether company name is required for addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'REQUIRE_COMPANY'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'ALLOW_ADDRESS_LINE_2',
        'TRUE',
        'Whether address line 2 is allowed for addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'ALLOW_ADDRESS_LINE_2'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'REQUIRE_DELIVERY_INSTRUCTIONS',
        'FALSE',
        'Whether delivery instructions are required for addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'REQUIRE_DELIVERY_INSTRUCTIONS'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'MAX_ADDRESS_BOOK_ENTRIES',
        '10',
        'Maximum number of address book entries allowed per customer in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'MAX_ADDRESS_BOOK_ENTRIES'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'DEFAULT_ADDRESS_TYPE',
        'BOTH',
        'Default address type for new addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'DEFAULT_ADDRESS_TYPE'
      );
    `);

    await queryRunner.query(`
      INSERT INTO address_book_config (country_id, config_key, config_value, description)
      SELECT
        c.id,
        'REQUIRE_ADMINISTRATIVE_DIVISIONS',
        'TRUE',
        'Whether administrative divisions (province/ward) are required for addresses in this country'
      FROM countries c
      WHERE c.id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM address_book_config abc
        WHERE abc.country_id = c.id AND abc.config_key = 'REQUIRE_ADMINISTRATIVE_DIVISIONS'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove config_id column from address_book table if it exists
    await queryRunner.query(`
      ALTER TABLE address_book
      DROP CONSTRAINT IF EXISTS fk_address_book_config,
      DROP COLUMN IF EXISTS config_id;
    `);

    // Drop indexes if they exist
    try {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_address_book_config_id;`);
    } catch (e) {
      // Index might not exist
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_address_book_config_deleted_at;`);
    } catch (e) {
      // Index might not exist
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_address_book_config_created_at;`);
    } catch (e) {
      // Index might not exist
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_address_book_config_is_active;`);
    } catch (e) {
      // Index might not exist
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_address_book_config_config_key;`);
    } catch (e) {
      // Index might not exist
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_address_book_config_country_id;`);
    } catch (e) {
      // Index might not exist
    }

    // Drop table if it exists
    try {
      await queryRunner.query(`DROP TABLE IF EXISTS address_book_config;`);
    } catch (e) {
      // Table might not exist
    }
  }
}