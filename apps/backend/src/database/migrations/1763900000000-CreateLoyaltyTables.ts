import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoyaltyTables1763900000000 implements MigrationInterface {
  name = 'CreateLoyaltyTables1763900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create loyalty_tiers table
    await queryRunner.query(`
      CREATE TABLE loyalty_tiers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        min_points INTEGER NOT NULL,
        max_points INTEGER,
        color VARCHAR(7) NOT NULL DEFAULT '#000000',
        icon VARCHAR(100),
        benefits JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT true NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP
      );
    `);

    // Create loyalty_rewards table first
    await queryRunner.query(`
      CREATE TABLE loyalty_rewards (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL CHECK (type IN ('discount', 'free_shipping', 'free_product', 'cashback', 'gift_card', 'exclusive_access')),
        points_required INTEGER NOT NULL,
        value DECIMAL(10, 2),
        discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
        conditions TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        is_limited BOOLEAN DEFAULT false NOT NULL,
        total_quantity INTEGER,
        remaining_quantity INTEGER,
        starts_at TIMESTAMP,
        ends_at TIMESTAMP,
        image_url VARCHAR(500),
        terms_conditions TEXT,
        tier_restrictions JSONB NOT NULL DEFAULT '[]',
        auto_apply BOOLEAN DEFAULT false NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP
      );
    `);

    // Create loyalty_transactions table after loyalty_rewards
    await queryRunner.query(`
      CREATE TABLE loyalty_transactions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted', 'referral_bonus')),
        description TEXT NOT NULL,
        order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
        reward_id uuid REFERENCES loyalty_rewards(id) ON DELETE SET NULL,
        balance_after INTEGER NOT NULL,
        expires_at TIMESTAMP,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP
      );
    `);

    // Create customer_redemptions table
    await queryRunner.query(`
      CREATE TABLE customer_redemptions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        reward_id uuid NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
        points_used INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'cancelled')),
        redemption_code VARCHAR(100) UNIQUE,
        used_at TIMESTAMP,
        expires_at TIMESTAMP,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP
      );
    `);

    // Create indexes for loyalty_tiers
    await queryRunner.query(`CREATE INDEX idx_loyalty_tiers_min_points ON loyalty_tiers(min_points);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_tiers_is_active ON loyalty_tiers(is_active);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_tiers_sort_order ON loyalty_tiers(sort_order);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_tiers_deleted_at ON loyalty_tiers(deleted_at);`);

    // Create indexes for loyalty_transactions
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_reward_id ON loyalty_transactions(reward_id);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_expires_at ON loyalty_transactions(expires_at);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_deleted_at ON loyalty_transactions(deleted_at);`);

    // Create composite index for customer transaction history
    await queryRunner.query(`
      CREATE INDEX idx_loyalty_transactions_customer_created
      ON loyalty_transactions(customer_id, created_at)
      WHERE deleted_at IS NULL;
    `);

    // Create indexes for loyalty_rewards
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_type ON loyalty_rewards(type);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_points_required ON loyalty_rewards(points_required);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_is_active ON loyalty_rewards(is_active);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_starts_at ON loyalty_rewards(starts_at);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_ends_at ON loyalty_rewards(ends_at);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_sort_order ON loyalty_rewards(sort_order);`);
    await queryRunner.query(`CREATE INDEX idx_loyalty_rewards_deleted_at ON loyalty_rewards(deleted_at);`);

    // Create composite index for active rewards
    await queryRunner.query(`
      CREATE INDEX idx_loyalty_rewards_active_available
      ON loyalty_rewards(is_active, points_required, starts_at, ends_at)
      WHERE deleted_at IS NULL;
    `);

    // Create indexes for customer_redemptions
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_customer_id ON customer_redemptions(customer_id);`);
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_reward_id ON customer_redemptions(reward_id);`);
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_status ON customer_redemptions(status);`);
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_redemption_code ON customer_redemptions(redemption_code);`);
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_expires_at ON customer_redemptions(expires_at);`);
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_created_at ON customer_redemptions(created_at);`);
    await queryRunner.query(`CREATE INDEX idx_customer_redemptions_deleted_at ON customer_redemptions(deleted_at);`);

    // Create composite index for active customer redemptions
    await queryRunner.query(`
      CREATE INDEX idx_customer_redemptions_active_expiring
      ON customer_redemptions(customer_id, status, expires_at)
      WHERE deleted_at IS NULL;
    `);

    // Insert default loyalty tiers
    await queryRunner.query(`
      INSERT INTO loyalty_tiers (name, description, min_points, max_points, color, benefits, sort_order) VALUES
      ('Bronze', 'Entry level membership', 0, 199, '#CD7F32', '["Basic point earning", "Standard customer support"]', 1),
      ('Silver', 'Valued customer tier', 200, 499, '#C0C0C0', '["Enhanced point earning (1.2x)", "Priority customer support", "Birthday bonus"]', 2),
      ('Gold', 'Premium membership', 500, 999, '#FFD700', '["Premium point earning (1.5x)", "Dedicated support", "Exclusive offers", "Early access to sales"]', 3),
      ('Platinum', 'Elite membership', 1000, NULL, '#E5E4E2', '["Elite point earning (2x)", "VIP support", "Exclusive events", "Personal shopping assistant", "Free shipping on all orders"]', 4);
    `);

    // Add unique constraint to prevent overlapping tier ranges
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_loyalty_tiers_no_overlap
      ON loyalty_tiers(min_points)
      WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop unique constraint
    await queryRunner.query(`DROP INDEX idx_loyalty_tiers_no_overlap;`);

    // Drop indexes for customer_redemptions
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_active_expiring;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_deleted_at;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_created_at;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_expires_at;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_redemption_code;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_status;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_reward_id;`);
    await queryRunner.query(`DROP INDEX idx_customer_redemptions_customer_id;`);

    // Drop indexes for loyalty_rewards
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_active_available;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_deleted_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_sort_order;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_ends_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_starts_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_is_active;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_points_required;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_rewards_type;`);

    // Drop indexes for loyalty_transactions
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_customer_created;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_deleted_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_expires_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_reward_id;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_order_id;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_created_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_type;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_transactions_customer_id;`);

    // Drop indexes for loyalty_tiers
    await queryRunner.query(`DROP INDEX idx_loyalty_tiers_deleted_at;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_tiers_sort_order;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_tiers_is_active;`);
    await queryRunner.query(`DROP INDEX idx_loyalty_tiers_min_points;`);

    // Drop tables
    await queryRunner.query(`DROP TABLE customer_redemptions;`);
    await queryRunner.query(`DROP TABLE loyalty_rewards;`);
    await queryRunner.query(`DROP TABLE loyalty_transactions;`);
    await queryRunner.query(`DROP TABLE loyalty_tiers;`);
  }
}