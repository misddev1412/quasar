import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMenuBorderConfig1769500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('menus', [
      new TableColumn({
        name: 'border_color',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Hex or CSS color used for menu borders',
      }),
      new TableColumn({
        name: 'border_width',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'CSS border width (e.g. 1px, 0.125rem)',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('menus', 'border_width');
    await queryRunner.dropColumn('menus', 'border_color');
  }
}
