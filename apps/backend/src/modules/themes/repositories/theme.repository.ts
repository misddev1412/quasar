import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { ThemeEntity } from '../entities/theme.entity';
import { ThemeColorModesDto, ThemeFiltersDto } from '../dto/theme.dto';
import { DEFAULT_DARK_THEME_COLORS, DEFAULT_LIGHT_THEME_COLORS } from '../constants/theme-colors.constant';

@Injectable()
export class ThemeRepository extends BaseRepository<ThemeEntity> {
  private readonly logger = new Logger(ThemeRepository.name);

  constructor(
    @InjectRepository(ThemeEntity)
    private readonly themeRepo: Repository<ThemeEntity>,
  ) {
    super(themeRepo);
  }

  async findBySlug(slug: string): Promise<ThemeEntity | null> {
    return this.themeRepo.findOne({
      where: { slug, deletedAt: IsNull() },
    });
  }

  async findDefault(): Promise<ThemeEntity | null> {
    try {
      return await this.themeRepo.findOne({
        where: { isDefault: true, deletedAt: IsNull() },
      });
    } catch (error: any) {
      if (error instanceof QueryFailedError && this.shouldFallbackToLegacyColors(error)) {
        this.logger.warn(
          'Falling back to legacy theme schema while loading default theme. Please run the latest theme migrations.',
        );
        return this.findLegacyDefault();
      }
      throw error;
    }
  }

  async setDefault(themeId: string): Promise<ThemeEntity> {
    await this.themeRepo
      .createQueryBuilder()
      .update(ThemeEntity)
      .set({ isDefault: false })
      .where('isDefault = :isDefault', { isDefault: true })
      .andWhere('id != :themeId', { themeId })
      .execute();

    await this.themeRepo.update(
      { id: themeId, deletedAt: IsNull() },
      { isDefault: true, isActive: true },
    );

    const updated = await this.findById(themeId);
    if (!updated) {
      throw new Error('Theme not found after setting default');
    }
    return updated;
  }

  async findWithFilters(filters: ThemeFiltersDto) {
    const { page = 1, limit = 12, search, isActive } = filters;
    const qb = this.themeRepo.createQueryBuilder('theme');

    qb.where('theme.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(LOWER(theme.name) LIKE LOWER(:search) OR LOWER(theme.slug) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (typeof isActive === 'boolean') {
      qb.andWhere('theme.isActive = :isActive', { isActive });
    }

    qb.orderBy('theme.isDefault', 'DESC')
      .addOrderBy('theme.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    try {
      const [data, total] = await qb.getManyAndCount();
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error: any) {
      if (error instanceof QueryFailedError && this.shouldFallbackToLegacyColors(error)) {
        this.logger.warn(
          'Falling back to legacy theme color schema due to database schema mismatch. Please run the latest migrations.',
        );
        return this.findWithLegacySchema(filters);
      }
      throw error;
    }
  }

  private shouldFallbackToLegacyColors(error: QueryFailedError): boolean {
    const message = (error.message || '').toLowerCase();
    return message.includes('color_modes') || message.includes('ordered-set aggregate mode');
  }

  private async findWithLegacySchema(filters: ThemeFiltersDto) {
    const { page = 1, limit = 12, search, isActive } = filters;
    const whereClauses = ['"deleted_at" IS NULL'];
    const whereParams: any[] = [];

    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      whereParams.push(searchParam);
      const nameIdx = whereParams.length;
      whereParams.push(searchParam);
      const slugIdx = whereParams.length;
      whereClauses.push(`(LOWER("name") LIKE $${nameIdx} OR LOWER("slug") LIKE $${slugIdx})`);
    }

    if (typeof isActive === 'boolean') {
      whereParams.push(isActive);
      const idx = whereParams.length;
      whereClauses.push(`"is_active" = $${idx}`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const limitIdx = whereParams.length + 1;
    const offsetIdx = whereParams.length + 2;

    const dataSql = `
      SELECT
        "id",
        "name",
        "slug",
        "description",
        "is_active",
        "is_default",
        "body_background_color",
        "surface_background_color",
        "text_color",
        "muted_text_color",
        "primary_color",
        "primary_text_color",
        "secondary_color",
        "secondary_text_color",
        "accent_color",
        "border_color",
        "created_at",
        "updated_at"
      FROM "themes"
      ${whereSql}
      ORDER BY "is_default" DESC, "created_at" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const dataParams = [...whereParams, limit, offset];
    const rows = await this.themeRepo.query(dataSql, dataParams);
    const countSql = `SELECT COUNT(*)::int AS count FROM "themes" ${whereSql};`;
    const countResult = await this.themeRepo.query(countSql, whereParams);
    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const data = rows.map(row => this.mapLegacyRowToTheme(row));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  private mapLegacyRowToTheme(row: any): ThemeEntity {
    const lightPalette = {
      bodyBackgroundColor: row.body_background_color ?? DEFAULT_LIGHT_THEME_COLORS.bodyBackgroundColor,
      surfaceBackgroundColor: row.surface_background_color ?? DEFAULT_LIGHT_THEME_COLORS.surfaceBackgroundColor,
      textColor: row.text_color ?? DEFAULT_LIGHT_THEME_COLORS.textColor,
      mutedTextColor: row.muted_text_color ?? DEFAULT_LIGHT_THEME_COLORS.mutedTextColor,
      primaryColor: row.primary_color ?? DEFAULT_LIGHT_THEME_COLORS.primaryColor,
      primaryTextColor: row.primary_text_color ?? DEFAULT_LIGHT_THEME_COLORS.primaryTextColor,
      secondaryColor: row.secondary_color ?? DEFAULT_LIGHT_THEME_COLORS.secondaryColor,
      secondaryTextColor: row.secondary_text_color ?? DEFAULT_LIGHT_THEME_COLORS.secondaryTextColor,
      accentColor: row.accent_color ?? DEFAULT_LIGHT_THEME_COLORS.accentColor,
      borderColor: row.border_color ?? DEFAULT_LIGHT_THEME_COLORS.borderColor,
    };

    const colors: ThemeColorModesDto = {
      light: lightPalette,
      dark: { ...DEFAULT_DARK_THEME_COLORS },
    };

    return this.themeRepo.create({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      colors,
      isActive: row.is_active,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as ThemeEntity);
  }

  private async findLegacyDefault(): Promise<ThemeEntity | null> {
    const rows = await this.themeRepo.query(
      `
        SELECT
          "id",
          "name",
          "slug",
          "description",
          "is_active",
          "is_default",
          "body_background_color",
          "surface_background_color",
          "text_color",
          "muted_text_color",
          "primary_color",
          "primary_text_color",
          "secondary_color",
          "secondary_text_color",
          "accent_color",
          "border_color",
          "created_at",
          "updated_at"
        FROM "themes"
        WHERE "deleted_at" IS NULL
        ORDER BY "is_default" DESC, "created_at" DESC
        LIMIT 1;
      `,
    );
    if (!rows?.length) {
      return null;
    }
    return this.mapLegacyRowToTheme(rows[0]);
  }
}
