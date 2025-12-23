import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsContactOrderToOrders1766511173805 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'is_contact_order',
                type: 'boolean',
                default: false,
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('orders', 'is_contact_order');
    }

}
