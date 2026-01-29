import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoGridSectionType1778400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."section_type_enum" ADD VALUE 'video_grid'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Removing values from enums is not easily supported in PostgreSQL without recreating the type.
    }
}
