import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddMailTemplateIdToMailChannelPriorities1767000000006 implements MigrationInterface {
  private readonly tableName = 'mail_channel_priorities';
  private readonly columnName = 'mail_template_id';
  private readonly foreignKeyName = 'FK_MAIL_CHANNEL_PRIORITY_TEMPLATE';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);
    if (!hasTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(this.tableName, this.columnName);
    if (!hasColumn) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: this.columnName,
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable(this.tableName);
    const foreignKeys = table?.foreignKeys || [];
    const hasForeignKey = foreignKeys.some((fk) => fk.name === this.foreignKeyName);
    if (!hasForeignKey) {
      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          name: this.foreignKeyName,
          columnNames: [this.columnName],
          referencedTableName: 'mail_templates',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);
    if (!hasTable) {
      return;
    }

    const table = await queryRunner.getTable(this.tableName);
    const foreignKeys = table?.foreignKeys || [];
    const foreignKey = foreignKeys.find((fk) => fk.name === this.foreignKeyName);
    if (foreignKey) {
      await queryRunner.dropForeignKey(this.tableName, foreignKey);
    }

    const hasColumn = await queryRunner.hasColumn(this.tableName, this.columnName);
    if (hasColumn) {
      await queryRunner.dropColumn(this.tableName, this.columnName);
    }
  }
}
