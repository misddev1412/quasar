import { MigrationInterface, QueryRunner } from 'typeorm';
import slugify from 'slugify';

export class AddSlugToProducts1771000000000 implements MigrationInterface {
  name = 'AddSlugToProducts1771000000000';

  private readonly vietnameseCharMap: Record<string, string> = {
    đ: 'd',
    Đ: 'D',
    ă: 'a',
    Ă: 'A',
    â: 'a',
    Â: 'A',
    ê: 'e',
    Ê: 'E',
    ô: 'o',
    Ô: 'O',
    ơ: 'o',
    Ơ: 'O',
    ư: 'u',
    Ư: 'U',
    ý: 'y',
    Ý: 'Y',
  };

  private generateProductSlug(text?: string, fallbackBase: string = 'product'): string {
    const source = (text || '').trim();
    let slug = slugify(source || fallbackBase, {
      lower: true,
      strict: false,
      trim: true,
      replacement: '-',
      remove: /[*+~()'"]/g,
      locale: 'vi',
    });

    Object.entries(this.vietnameseCharMap).forEach(([char, replacement]) => {
      const regex = new RegExp(char, 'g');
      slug = slug.replace(regex, replacement);
    });

    slug = slug
      .replace(/[,;.:!?@#$%^&<>{}[\]\\|`=]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = fallbackBase || 'product';
    }

    return slug.substring(0, 120).replace(/-+$/, '');
  }

  private ensureUniqueSlug(baseSlug: string, usedSlugs: Set<string>): string {
    const safeBase = baseSlug && baseSlug.trim().length > 0 ? baseSlug.trim() : `product-${Date.now()}`;
    let slug = safeBase;
    let counter = 1;

    while (usedSlugs.has(slug)) {
      const suffix = `-${counter}`;
      const trimmedBase = safeBase.substring(0, Math.max(1, 120 - suffix.length)).replace(/-+$/, '');
      slug = `${trimmedBase}${suffix}`;
      counter += 1;
    }

    usedSlugs.add(slug);
    return slug;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "slug" character varying(255)
    `);

    const existingSlugsResult = await queryRunner.query(`
      SELECT slug FROM "products"
      WHERE slug IS NOT NULL AND slug <> ''
    `) as Array<{ slug: string | null }>;
    const usedSlugs = new Set(
      existingSlugsResult
        .map(row => row.slug?.trim())
        .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
    );

    const productsNeedingSlugs = await queryRunner.query(`
      SELECT id, name
      FROM "products"
      WHERE slug IS NULL OR slug = ''
      ORDER BY "created_at" ASC
    `) as Array<{ id: string; name: string | null }>;

    for (const product of productsNeedingSlugs) {
      const fallbackBase = product.name && product.name.trim().length > 0
        ? product.name
        : `product-${product.id.slice(0, 8)}`;
      const normalizedSlug = this.generateProductSlug(product.name, fallbackBase);
      const uniqueSlug = this.ensureUniqueSlug(normalizedSlug, usedSlugs);

      await queryRunner.query(
        `UPDATE "products" SET "slug" = $1 WHERE "id" = $2`,
        [uniqueSlug, product.id],
      );
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_products_slug"
      ON "products" ("slug")
      WHERE "slug" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_slug"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "slug"`);
  }
}
