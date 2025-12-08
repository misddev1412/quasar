import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionToAddressBook1765200000000 implements MigrationInterface {
  name = 'AddVersionToAddressBook1765200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "address_book"
      ADD "version" integer NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "address_book" DROP COLUMN "version"
    `);
  }
}