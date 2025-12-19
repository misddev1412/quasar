import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEmailFlowsToMailChannelPriorities1767000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('email_flows');
    if (!hasTable) {
      return;
    }

    await queryRunner.renameTable('email_flows', 'mail_channel_priorities');
    await queryRunner.query(
      'ALTER INDEX IF EXISTS "IDX_EMAIL_FLOW_NAME" RENAME TO "IDX_MAIL_CHANNEL_PRIORITY_NAME"',
    );
    await queryRunner.query(
      'ALTER INDEX IF EXISTS "IDX_EMAIL_FLOW_ACTIVE" RENAME TO "IDX_MAIL_CHANNEL_PRIORITY_ACTIVE"',
    );
    await queryRunner.query(
      'ALTER INDEX IF EXISTS "IDX_EMAIL_FLOW_PROVIDER" RENAME TO "IDX_MAIL_CHANNEL_PRIORITY_PROVIDER"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mail_channel_priorities');
    if (!hasTable) {
      return;
    }

    await queryRunner.renameTable('mail_channel_priorities', 'email_flows');
    await queryRunner.query(
      'ALTER INDEX IF EXISTS "IDX_MAIL_CHANNEL_PRIORITY_NAME" RENAME TO "IDX_EMAIL_FLOW_NAME"',
    );
    await queryRunner.query(
      'ALTER INDEX IF EXISTS "IDX_MAIL_CHANNEL_PRIORITY_ACTIVE" RENAME TO "IDX_EMAIL_FLOW_ACTIVE"',
    );
    await queryRunner.query(
      'ALTER INDEX IF EXISTS "IDX_MAIL_CHANNEL_PRIORITY_PROVIDER" RENAME TO "IDX_EMAIL_FLOW_PROVIDER"',
    );
  }
}
