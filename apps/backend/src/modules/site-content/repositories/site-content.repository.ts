import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository, SortOrder } from '@shared';
import { PaginatedResult } from '@shared/types/common.types';
import { SiteContentEntity } from '../entities/site-content.entity';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

export interface SiteContentListParams {
  page: number;
  limit: number;
  search?: string;
  category?: SiteContentCategory;
  status?: SiteContentStatus;
  languageCode?: string;
  isFeatured?: boolean;
  fromPublishedAt?: Date;
  toPublishedAt?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'displayOrder';
  sortOrder?: SortOrder;
}

@Injectable()
export class SiteContentRepository extends BaseRepository<SiteContentEntity> {
  constructor(
    @InjectRepository(SiteContentEntity)
    private readonly siteContentRepo: Repository<SiteContentEntity>,
  ) {
    super(siteContentRepo);
  }

  async findBySlug(slug: string): Promise<SiteContentEntity | null> {
    return this.siteContentRepo.findOne({ where: { slug } });
  }

  async findByCode(code: string): Promise<SiteContentEntity | null> {
    return this.siteContentRepo.findOne({ where: { code } });
  }

  async listWithFilters(filters: SiteContentListParams): Promise<PaginatedResult<SiteContentEntity>> {
    const {
      page,
      limit,
      search,
      category,
      status,
      languageCode,
      isFeatured,
      fromPublishedAt,
      toPublishedAt,
      sortBy,
      sortOrder = SortOrder.DESC,
    } = filters;

    const qb = this.siteContentRepo.createQueryBuilder('content');

    this.applyFilters(qb, {
      search,
      category,
      status,
      languageCode,
      isFeatured,
      fromPublishedAt,
      toPublishedAt,
    });

    this.applySorting(qb, sortBy, sortOrder);

    const skip = (page - 1) * limit;
    const take = limit;

    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.max(Math.ceil(total / limit), 1);

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

  private applyFilters(
    qb: SelectQueryBuilder<SiteContentEntity>,
    filters: Omit<SiteContentListParams, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
  ) {
    const {
      search,
      category,
      status,
      languageCode,
      isFeatured,
      fromPublishedAt,
      toPublishedAt,
    } = filters;

    if (search) {
      qb.andWhere(
        `(
          content.title ILIKE :search OR
          content.slug ILIKE :search OR
          content.code ILIKE :search OR
          content.summary ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere('content.category = :category', { category });
    }

    if (status) {
      qb.andWhere('content.status = :status', { status });
    }

    if (languageCode) {
      qb.andWhere('content.language_code = :languageCode', { languageCode });
    }

    if (typeof isFeatured === 'boolean') {
      qb.andWhere('content.is_featured = :isFeatured', { isFeatured });
    }

    if (fromPublishedAt) {
      qb.andWhere('content.published_at >= :fromPublishedAt', { fromPublishedAt });
    }

    if (toPublishedAt) {
      qb.andWhere('content.published_at <= :toPublishedAt', { toPublishedAt });
    }
  }

  private applySorting(
    qb: SelectQueryBuilder<SiteContentEntity>,
    sortBy: SiteContentListParams['sortBy'],
    sortOrder: SortOrder,
  ) {
    if (!sortBy) {
      qb.orderBy('content.display_order', 'ASC').addOrderBy('content.created_at', 'DESC');
      return;
    }

    const order = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

    switch (sortBy) {
      case 'updatedAt':
        qb.orderBy('content.updated_at', order);
        break;
      case 'publishedAt':
        qb.orderBy('content.published_at', order);
        break;
      case 'displayOrder':
        qb.orderBy('content.display_order', order).addOrderBy('content.created_at', 'DESC');
        break;
      case 'createdAt':
      default:
        qb.orderBy('content.created_at', order);
        break;
    }
  }
}
