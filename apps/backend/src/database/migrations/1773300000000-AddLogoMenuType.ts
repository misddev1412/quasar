import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogoMenuType1773300000000 implements MigrationInterface {
  name = 'AddLogoMenuType1773300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."menus_type_enum" ADD VALUE IF NOT EXISTS 'logo'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "menus_type_enum_old" AS ENUM (
        'link',
        'product',
        'category',
        'brand',
        'new_products',
        'sale_products',
        'featured_products',
        'banner',
        'custom_html',
        'site_content',
        'search_button',
        'search_bar',
        'locale_switcher',
        'theme_toggle',
        'cart_button',
        'user_profile',
        'call_button',
        'order_tracking',
        'top_phone',
        'top_email',
        'top_current_time',
        'top_marquee'
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "menus" ALTER COLUMN "type" TYPE "menus_type_enum_old" USING "type"::text::"menus_type_enum_old"`,
    );

    await queryRunner.query(`DROP TYPE "menus_type_enum"`);
    await queryRunner.query(`ALTER TYPE "menus_type_enum_old" RENAME TO "menus_type_enum"`);
  }
}
