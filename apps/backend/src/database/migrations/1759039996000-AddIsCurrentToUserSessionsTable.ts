import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsCurrentToUserSessionsTable1759039996000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column exists before adding it
        const table = await queryRunner.getTable('user_sessions');
        const isCurrentColumn = table?.findColumnByName('is_current');

        if (!isCurrentColumn) {
            await queryRunner.query(`
                ALTER TABLE "user_sessions"
                ADD COLUMN "is_current" boolean DEFAULT false
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_sessions"
            DROP COLUMN "is_current"
        `);
    }

}