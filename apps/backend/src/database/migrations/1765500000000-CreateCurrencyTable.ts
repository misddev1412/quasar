import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCurrencyTable1765500000000 implements MigrationInterface {
  name = 'CreateCurrencyTable1765500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "currencies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" varchar(3) NOT NULL,
        "name" varchar(100) NOT NULL,
        "symbol" varchar(10) NOT NULL,
        "exchange_rate" decimal(20, 8) NOT NULL DEFAULT 1.00000000,
        "is_default" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "decimal_places" integer NOT NULL DEFAULT 2,
        "format" varchar(20) NOT NULL DEFAULT '{symbol}{amount}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "updated_by" uuid,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_currencies" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_currencies_code" ON "currencies" ("code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_currencies_is_default" ON "currencies" ("is_default")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_currencies_is_active" ON "currencies" ("is_active")
    `);

    await queryRunner.query(`
      ALTER TABLE "currencies" ADD CONSTRAINT "FK_currencies_created_by"
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "currencies" ADD CONSTRAINT "FK_currencies_updated_by"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "currencies" ADD CONSTRAINT "CHK_currencies_exchange_rate_positive"
      CHECK (exchange_rate > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "currencies" ADD CONSTRAINT "CHK_currencies_decimal_places_range"
      CHECK (decimal_places >= 0 AND decimal_places <= 8)
    `);

    // Note: Single default currency constraint will be handled at application level
    // PostgreSQL doesn't support subqueries in CHECK constraints

    // Insert default currencies
    await queryRunner.query(`
      INSERT INTO currencies (code, name, symbol, exchange_rate, is_default, is_active, decimal_places, format) VALUES
      ('USD', 'US Dollar', '$', 1.00000000, true, true, 2, '{symbol}{amount}'),
      ('VND', 'Vietnamese Dong', '₫', 25455.00000000, false, true, 0, '{amount}{symbol}'),
      ('CNY', 'Chinese Yuan', '¥', 7.24000000, false, true, 2, '{symbol}{amount}'),
      ('EUR', 'Euro', '€', 0.92000000, false, true, 2, '{symbol}{amount}'),
      ('JPY', 'Japanese Yen', '¥', 149.50000000, false, true, 0, '{symbol}{amount}'),
      ('GBP', 'British Pound', '£', 0.79000000, false, true, 2, '{symbol}{amount}'),
      ('KRW', 'South Korean Won', '₩', 1318.00000000, false, true, 0, '{symbol}{amount}'),
      ('THB', 'Thai Baht', '฿', 36.50000000, false, true, 2, '{symbol}{amount}'),
      ('SGD', 'Singapore Dollar', 'S$', 1.35000000, false, true, 2, '{symbol}{amount}'),
      ('MYR', 'Malaysian Ringgit', 'RM', 4.65000000, false, true, 2, '{symbol}{amount}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "currencies" DROP CONSTRAINT "CHK_currencies_decimal_places_range"`);
    await queryRunner.query(`ALTER TABLE "currencies" DROP CONSTRAINT "CHK_currencies_exchange_rate_positive"`);
    await queryRunner.query(`ALTER TABLE "currencies" DROP CONSTRAINT "FK_currencies_updated_by"`);
    await queryRunner.query(`ALTER TABLE "currencies" DROP CONSTRAINT "FK_currencies_created_by"`);
    await queryRunner.query(`DROP INDEX "IDX_currencies_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_currencies_is_default"`);
    await queryRunner.query(`DROP INDEX "IDX_currencies_code"`);
    await queryRunner.query(`DROP TABLE "currencies"`);
  }
}