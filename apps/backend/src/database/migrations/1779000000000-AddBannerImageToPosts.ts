import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBannerImageToPosts1779000000000 implements MigrationInterface {
    name = 'AddBannerImageToPosts1779000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "posts" ADD "banner_image" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "posts" DROP COLUMN "banner_image"`,
        );
    }
}
