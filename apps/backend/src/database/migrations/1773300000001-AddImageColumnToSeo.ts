import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageColumnToSeo1773300000001 implements MigrationInterface {
  name = 'AddImageColumnToSeo1773300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seo" ADD "image" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "seo" DROP COLUMN "image"`);
  }
}
