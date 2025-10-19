import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultDepthMenusClosure1764600000000 implements MigrationInterface {
  name = 'SetDefaultDepthMenusClosure1764600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "menus_closure" SET "depth" = 0 WHERE "depth" IS NULL`);
    await queryRunner.query(`ALTER TABLE "menus_closure" ALTER COLUMN "depth" SET DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "menus_closure" ALTER COLUMN "depth" DROP DEFAULT`);
  }
}
