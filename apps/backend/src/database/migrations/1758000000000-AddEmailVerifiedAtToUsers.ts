import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerifiedAtToUsers1758000000000 implements MigrationInterface {
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add email_verified_at column to users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "email_verified_at" TIMESTAMP NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove email_verified_at column from users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "email_verified_at"
        `);
    }
}