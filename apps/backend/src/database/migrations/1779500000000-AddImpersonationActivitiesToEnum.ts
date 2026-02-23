import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImpersonationActivitiesToEnum1779500000000 implements MigrationInterface {
    name = 'AddImpersonationActivitiesToEnum1779500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_activities_activity_type_enum') THEN
          BEGIN
            ALTER TYPE "public"."user_activities_activity_type_enum" ADD VALUE IF NOT EXISTS 'impersonation_start';
            ALTER TYPE "public"."user_activities_activity_type_enum" ADD VALUE IF NOT EXISTS 'impersonation_end';
          EXCEPTION
            WHEN duplicate_object THEN NULL;
          END;
        END IF;
      END;
      $$;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL enum values cannot be removed easily once added.
    }
}
