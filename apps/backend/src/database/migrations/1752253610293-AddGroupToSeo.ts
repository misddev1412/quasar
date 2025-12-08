import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGroupToSeo1752253610293 implements MigrationInterface {
    name = 'AddGroupToSeo1752253610293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seo" ADD "group" character varying(255) NOT NULL DEFAULT 'general'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seo" DROP COLUMN "group"`);
    }

}
