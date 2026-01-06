import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSideBannersSectionType1773800000000 implements MigrationInterface {
  private readonly newSectionTypeValues = [
    'hero_slider',
    'featured_products',
    'products_by_category',
    'news',
    'custom_html',
    'banner',
    'side_banners',
    'testimonials',
    'cta',
    'features',
    'gallery',
    'team',
    'contact_form',
    'video',
    'stats',
    'brand_showcase',
    'why_choose_us',
  ];

  private readonly previousSectionTypeValues = [
    'hero_slider',
    'featured_products',
    'products_by_category',
    'news',
    'custom_html',
    'banner',
    'testimonials',
    'cta',
    'features',
    'gallery',
    'team',
    'contact_form',
    'video',
    'stats',
    'brand_showcase',
    'why_choose_us',
  ];

  private formatEnum(values: string[]): string {
    return values.map((value) => `'${value}'`).join(', ');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "section_type_enum_new" AS ENUM (${this.formatEnum(this.newSectionTypeValues)});
    `);
    await queryRunner.query(`
      ALTER TABLE "sections"
      ALTER COLUMN "type" TYPE "section_type_enum_new"
      USING "type"::text::"section_type_enum_new";
    `);
    await queryRunner.query(`DROP TYPE "section_type_enum";`);
    await queryRunner.query(`ALTER TYPE "section_type_enum_new" RENAME TO "section_type_enum";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "section_type_enum_old" AS ENUM (${this.formatEnum(this.previousSectionTypeValues)});
    `);
    await queryRunner.query(`
      ALTER TABLE "sections"
      ALTER COLUMN "type" TYPE "section_type_enum_old"
      USING "type"::text::"section_type_enum_old";
    `);
    await queryRunner.query(`DROP TYPE "section_type_enum";`);
    await queryRunner.query(`ALTER TYPE "section_type_enum_old" RENAME TO "section_type_enum";`);
  }
}
