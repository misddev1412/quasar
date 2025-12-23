import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsContactPriceToProducts1771300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'is_contact_price',
                type: 'boolean',
                default: false,
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'is_contact_price');
    }
}
