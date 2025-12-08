import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToAddressBook1765300000000 implements MigrationInterface {
  name = 'AddCreatedByToAddressBook1765300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD "created_by" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD CONSTRAINT "FK_address_book_created_by"
      FOREIGN KEY ("created_by")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "address_book" DROP CONSTRAINT "FK_address_book_created_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "address_book" DROP COLUMN "created_by"
    `);
  }
}