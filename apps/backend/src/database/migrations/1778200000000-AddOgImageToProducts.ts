import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOgImageToProducts1778200000000 implements MigrationInterface {
    name = 'AddOgImageToProducts1778200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "products" ADD "og_image" character varying(500)`,
        );
        await queryRunner.query(
            `ALTER TABLE "product_translations" ADD "og_image" character varying(500)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translations" DROP COLUMN "og_image"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "og_image"`);
    }
}
