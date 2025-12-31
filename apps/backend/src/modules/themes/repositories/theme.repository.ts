import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { ThemeEntity } from '../entities/theme.entity';
import { ThemeFiltersDto } from '../dto/theme.dto';

@Injectable()
export class ThemeRepository extends BaseRepository<ThemeEntity> {
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
    return this.themeRepo.findOne({
      where: { isDefault: true, deletedAt: IsNull() },
    });
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
    const { page = 1, limit = 12, search, isActive, mode } = filters;
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

    if (mode) {
      qb.andWhere('theme.mode = :mode', { mode });
    }

    qb.orderBy('theme.isDefault', 'DESC')
      .addOrderBy('theme.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

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
  }
}
