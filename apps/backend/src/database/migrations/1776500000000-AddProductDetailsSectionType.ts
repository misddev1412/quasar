import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDetailsSectionType1776500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."section_type_enum" ADD VALUE 'product_details'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // TypeORM does not support removing values from enums in a clean way in the down migration
        // without dropping and recreating the type, which is risky.
        // For this case, we'll leave it as is or we can implement a more complex revert if strictly needed.
        // Typically adding an enum value doesn't need a revert logic that removes it unless we are stricly rolling back.
    }
}
