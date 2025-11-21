import { MigrationInterface, QueryRunner } from 'typeorm';

interface TranslationSeed {
  locale: string;
  title: string;
  subtitle: string;
  description: string;
  configOverride: Record<string, unknown>;
}

export class AddHomeCtaBannerSection1766200000000 implements MigrationInterface {
  private readonly sectionId = '554fadb7-3391-4e5b-be28-139309a71464';

  private readonly sectionTypeValues = [
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
  ];

  private readonly originalSectionTypeValues = [
    'hero_slider',
    'featured_products',
    'products_by_category',
    'news',
    'custom_html',
  ];

  private readonly baseConfig = {
    layout: 'full-width',
    style: 'center',
    background: 'gradient',
    accentColor: '#f97316',
    backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80',
    overlayOpacity: 0.65,
  };

  private readonly translations: TranslationSeed[] = [
    {
      locale: 'en',
      title: 'Launch bold retail storytelling',
      subtitle: 'Ship CTA-driven banners without rewriting layouts',
      description: 'Highlight product drops, choreograph campaigns, and drive traffic to the next best action from one reusable block.',
      configOverride: {
        primaryCta: {
          label: 'Plan a launch',
          href: '/contact',
        },
        secondaryCta: {
          label: 'Browse docs',
          href: '/docs',
        },
      },
    },
    {
      locale: 'vi',
      title: 'Tăng tốc chiến dịch với CTA nổi bật',
      subtitle: 'Kích hoạt banner thu hút chỉ trong vài phút',
      description: 'Kể câu chuyện thương hiệu và dẫn dắt khách hàng đến hành động tiếp theo với một khối CTA linh hoạt.',
      configOverride: {
        primaryCta: {
          label: 'Trao đổi với đội ngũ',
          href: '/contact',
        },
        secondaryCta: {
          label: 'Xem tài liệu',
          href: '/docs',
        },
      },
    },
  ];

  private formatEnumValues(values: string[]): string {
    return values.map((value) => `'${value}'`).join(', ');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "section_type_enum_new" AS ENUM (${this.formatEnumValues(this.sectionTypeValues)});
    `);
    await queryRunner.query(`
      ALTER TABLE "sections"
      ALTER COLUMN "type" TYPE "section_type_enum_new"
      USING "type"::text::"section_type_enum_new";
    `);
    await queryRunner.query(`DROP TYPE "section_type_enum";`);
    await queryRunner.query(`ALTER TYPE "section_type_enum_new" RENAME TO "section_type_enum";`);

    await queryRunner.query(
      `
        INSERT INTO "sections" ("id", "page", "type", "position", "is_enabled", "config", "created_at", "updated_at", "version")
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW(), NOW(), 1)
        ON CONFLICT ("id") DO NOTHING;
      `,
      [this.sectionId, 'home', 'cta', 5, true, JSON.stringify(this.baseConfig)],
    );

    for (const translation of this.translations) {
      await queryRunner.query(
        `
          INSERT INTO "section_translations"
            ("id", "section_id", "locale", "title", "subtitle", "description", "hero_description", "config_override", "created_at", "updated_at", "version")
          VALUES
            (gen_random_uuid(), $1, $2, $3, $4, $5, NULL, $6::jsonb, NOW(), NOW(), 1)
          ON CONFLICT ("section_id", "locale") DO NOTHING;
        `,
        [
          this.sectionId,
          translation.locale,
          translation.title,
          translation.subtitle,
          translation.description,
          JSON.stringify(translation.configOverride ?? {}),
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "section_translations" WHERE "section_id" = $1;`,
      [this.sectionId],
    );
    await queryRunner.query(
      `DELETE FROM "sections" WHERE "id" = $1;`,
      [this.sectionId],
    );

    await queryRunner.query(`
      CREATE TYPE "section_type_enum_old" AS ENUM (${this.formatEnumValues(this.originalSectionTypeValues)});
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
