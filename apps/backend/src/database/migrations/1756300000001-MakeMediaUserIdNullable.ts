import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeMediaUserIdNullable1756300000001 implements MigrationInterface {
  name = 'MakeMediaUserIdNullable1756300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make userId column nullable in media table
    await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "userId" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This down migration assumes all media records have valid userId values
    // Make userId column not nullable again
    await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "userId" SET NOT NULL`);
  }
}