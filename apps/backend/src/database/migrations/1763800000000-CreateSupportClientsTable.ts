import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportClientsTable1763800000000 implements MigrationInterface {
  name = 'CreateSupportClientsTable1763800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create support_clients table
    await queryRunner.query(`
      CREATE TABLE support_clients (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('MESSENGER', 'ZALO', 'WHATSAPP', 'TELEGRAM', 'VIBER', 'SKYPE', 'LINE', 'WECHAT', 'KAKAOTALK', 'EMAIL', 'PHONE', 'CUSTOM')),
        description TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        is_default BOOLEAN DEFAULT false NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        configuration JSONB NOT NULL DEFAULT '{}',
        widget_settings JSONB NOT NULL DEFAULT '{}',
        icon_url VARCHAR(500),
        target_audience JSONB,
        schedule_enabled BOOLEAN DEFAULT false NOT NULL,
        schedule_start TIMESTAMP,
        schedule_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_support_clients_type ON support_clients(type);`);
    await queryRunner.query(`CREATE INDEX idx_support_clients_is_active ON support_clients(is_active);`);
    await queryRunner.query(`CREATE INDEX idx_support_clients_is_default ON support_clients(is_default);`);
    await queryRunner.query(`CREATE INDEX idx_support_clients_sort_order ON support_clients(sort_order);`);
    await queryRunner.query(`CREATE INDEX idx_support_clients_created_at ON support_clients(created_at);`);
    await queryRunner.query(`CREATE INDEX idx_support_clients_deleted_at ON support_clients(deleted_at);`);

    // Create composite index for active clients with scheduling
    await queryRunner.query(`
      CREATE INDEX idx_support_clients_active_scheduled
      ON support_clients(is_active, schedule_enabled, schedule_start, schedule_end)
      WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX idx_support_clients_active_scheduled;`);
    await queryRunner.query(`DROP INDEX idx_support_clients_deleted_at;`);
    await queryRunner.query(`DROP INDEX idx_support_clients_created_at;`);
    await queryRunner.query(`DROP INDEX idx_support_clients_sort_order;`);
    await queryRunner.query(`DROP INDEX idx_support_clients_is_default;`);
    await queryRunner.query(`DROP INDEX idx_support_clients_is_active;`);
    await queryRunner.query(`DROP INDEX idx_support_clients_type;`);

    // Drop table
    await queryRunner.query(`DROP TABLE support_clients;`);
  }
}