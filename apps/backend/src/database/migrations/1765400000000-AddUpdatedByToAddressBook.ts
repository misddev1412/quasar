import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedByToAddressBook1765400000000 implements MigrationInterface {
  name = 'AddUpdatedByToAddressBook1765400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD "updated_by" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD CONSTRAINT "FK_address_book_updated_by"
      FOREIGN KEY ("updated_by")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "address_book" DROP CONSTRAINT "FK_address_book_updated_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book" DROP COLUMN "updated_by"
    `);
  }
}