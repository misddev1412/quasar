import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsDetailsSectionType1776500000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."section_type_enum" ADD VALUE 'news_details'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // TypeORM does not support removing values from enums in a clean way in the down migration
        // without dropping and recreating the type, which is risky.
    }
}
