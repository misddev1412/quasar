import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirebaseAuthenticationSupport1759000000000 implements MigrationInterface {
  name = 'AddFirebaseAuthenticationSupport1759000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add Firebase-related fields to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "firebase_uid" VARCHAR(255) NULL UNIQUE,
      ADD COLUMN "provider" VARCHAR(50) DEFAULT 'email',
      ADD COLUMN "provider_id" VARCHAR(255) NULL,
      ADD COLUMN "avatar_url" TEXT NULL,
      ADD COLUMN "email_verified" BOOLEAN DEFAULT FALSE,
      ADD COLUMN "last_login_at" TIMESTAMP NULL,
      ADD COLUMN "login_count" INTEGER DEFAULT 0
    `);

    // Create user_login_providers table for tracking multiple authentication methods
    await queryRunner.query(`
      CREATE TABLE "user_login_providers" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "version" INTEGER NOT NULL DEFAULT 1,
        "created_by" UUID NULL,
        "updated_by" UUID NULL,
        "user_id" UUID NOT NULL,
        "provider" VARCHAR(50) NOT NULL,
        "provider_id" VARCHAR(255) NOT NULL,
        "provider_email" VARCHAR(255) NULL,
        "provider_data" JSONB NULL,
        "is_verified" BOOLEAN DEFAULT FALSE,
        "last_used_at" TIMESTAMP NULL,
        "access_token" TEXT NULL,
        "refresh_token" TEXT NULL,
        "expires_at" TIMESTAMP NULL,
        CONSTRAINT "PK_user_login_providers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_provider" UNIQUE ("user_id", "provider", "provider_id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "user_login_providers" 
      ADD CONSTRAINT "FK_user_login_providers_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_users_firebase_uid" ON "users" ("firebase_uid")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_provider" ON "users" ("provider")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_provider_id" ON "users" ("provider_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email_verified" ON "users" ("email_verified")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_last_login_at" ON "users" ("last_login_at")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_user_login_providers_user_id" ON "user_login_providers" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_login_providers_provider" ON "user_login_providers" ("provider")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_login_providers_provider_id" ON "user_login_providers" ("provider_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_login_providers_last_used_at" ON "user_login_providers" ("last_used_at")`);

    // Update existing users to have email provider
    await queryRunner.query(`
      UPDATE "users" 
      SET "provider" = 'email', "email_verified" = TRUE 
      WHERE "provider" IS NULL OR "provider" = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_login_providers_last_used_at"`);
    await queryRunner.query(`DROP INDEX "IDX_user_login_providers_provider_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_login_providers_provider"`);
    await queryRunner.query(`DROP INDEX "IDX_user_login_providers_user_id"`);
    
    await queryRunner.query(`DROP INDEX "IDX_users_last_login_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email_verified"`);
    await queryRunner.query(`DROP INDEX "IDX_users_provider_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_provider"`);
    await queryRunner.query(`DROP INDEX "IDX_users_firebase_uid"`);

    // Drop user_login_providers table
    await queryRunner.query(`DROP TABLE "user_login_providers"`);

    // Remove Firebase-related columns from users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "firebase_uid",
      DROP COLUMN "provider",
      DROP COLUMN "provider_id", 
      DROP COLUMN "avatar_url",
      DROP COLUMN "email_verified",
      DROP COLUMN "last_login_at",
      DROP COLUMN "login_count"
    `);
  }
}