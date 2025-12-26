import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderTrackingMenuType1773200000000 implements MigrationInterface {
  name = 'AddOrderTrackingMenuType1773200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'menus_type_enum') THEN
          CREATE TYPE "menus_type_enum" AS ENUM (
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
          );

          ALTER TABLE "menus"
          ALTER COLUMN "type" TYPE "menus_type_enum"
          USING "type"::text::"menus_type_enum";
        END IF;
      END $$;
    `);

    await queryRunner.query(
      `ALTER TYPE "public"."menus_type_enum" ADD VALUE IF NOT EXISTS 'order_tracking'`,
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
