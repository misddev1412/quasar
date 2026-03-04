import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInquiriesTable1780100000000 implements MigrationInterface {
  name = 'CreateInquiriesTable1780100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status_enum') THEN
          CREATE TYPE "inquiry_status_enum" AS ENUM ('PENDING', 'PROCESSED', 'REJECTED', 'SPAM');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT,
        subject VARCHAR(255),
        product_id uuid,
        service_id uuid,
        url VARCHAR(500),
        status inquiry_status_enum NOT NULL DEFAULT 'PENDING',
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(phone);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_product_id ON inquiries(product_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_service_id ON inquiries(service_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_deleted_at ON inquiries(deleted_at);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_service_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_product_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_phone;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inquiries_email;`);

    await queryRunner.query(`DROP TABLE IF EXISTS inquiries;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inquiry_status_enum";`);
  }
}

