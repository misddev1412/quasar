import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerTransactionsTable1766000000000 implements MigrationInterface {
  name = 'CreateCustomerTransactionsTable1766000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE customer_transactions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        transaction_code VARCHAR(30) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('order_payment', 'refund', 'wallet_topup', 'withdrawal', 'adjustment', 'subscription')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
        impact_direction VARCHAR(10) NOT NULL CHECK (impact_direction IN ('credit', 'debit')),
        impact_amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        channel VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (channel IN ('system', 'admin', 'customer', 'automation')),
        reference_id VARCHAR(100),
        description TEXT,
        related_entity_type VARCHAR(50),
        related_entity_id uuid,
        total_amount DECIMAL(12, 2) NOT NULL,
        entry_count INTEGER NOT NULL DEFAULT 0,
        processed_at TIMESTAMP,
        failure_reason TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        version INTEGER NOT NULL DEFAULT 1,
        created_by uuid,
        updated_by uuid,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE customer_transaction_entries (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        transaction_id uuid NOT NULL REFERENCES customer_transactions(id) ON DELETE CASCADE,
        entry_direction VARCHAR(10) NOT NULL CHECK (entry_direction IN ('credit', 'debit')),
        ledger_account VARCHAR(50) NOT NULL CHECK (ledger_account IN ('customer_balance', 'platform_clearing', 'promotion_reserve', 'bank_settlement', 'adjustment')),
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        description TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        created_by uuid,
        updated_by uuid,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX idx_customer_transactions_customer ON customer_transactions(customer_id);`);
    await queryRunner.query(`CREATE INDEX idx_customer_transactions_status ON customer_transactions(status);`);
    await queryRunner.query(`CREATE INDEX idx_customer_transactions_type ON customer_transactions(type);`);
    await queryRunner.query(`CREATE INDEX idx_customer_transactions_code ON customer_transactions(transaction_code);`);
    await queryRunner.query(`CREATE INDEX idx_customer_transactions_created_at ON customer_transactions(created_at);`);
    await queryRunner.query(`CREATE INDEX idx_customer_transactions_related_entity ON customer_transactions(related_entity_type, related_entity_id);`);

    await queryRunner.query(`CREATE INDEX idx_transaction_entries_transaction ON customer_transaction_entries(transaction_id);`);
    await queryRunner.query(`CREATE INDEX idx_transaction_entries_account ON customer_transaction_entries(ledger_account);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_transaction_entries_account;`);
    await queryRunner.query(`DROP INDEX idx_transaction_entries_transaction;`);
    await queryRunner.query(`DROP TABLE customer_transaction_entries;`);

    await queryRunner.query(`DROP INDEX idx_customer_transactions_related_entity;`);
    await queryRunner.query(`DROP INDEX idx_customer_transactions_created_at;`);
    await queryRunner.query(`DROP INDEX idx_customer_transactions_code;`);
    await queryRunner.query(`DROP INDEX idx_customer_transactions_type;`);
    await queryRunner.query(`DROP INDEX idx_customer_transactions_status;`);
    await queryRunner.query(`DROP INDEX idx_customer_transactions_customer;`);
    await queryRunner.query(`DROP TABLE customer_transactions;`);
  }
}
