import { Injectable } from '@nestjs/common';
import { SiteContentRepository } from '../repositories/site-content.repository';
import { SiteContentEntity } from '../entities/site-content.entity';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';
import { PaginatedDto } from '@shared/classes/pagination.dto';
import { SortOrder } from '@shared/enums/common.enums';

export interface ClientSiteContentListParams {
  page?: number;
  limit?: number;
  category?: SiteContentCategory;
  languageCode?: string;
  isFeatured?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'displayOrder';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ClientSiteContentService {
  constructor(private readonly siteContentRepository: SiteContentRepository) {}

  async listPublishedSiteContents(query: ClientSiteContentListParams = {}): Promise<PaginatedDto<SiteContentEntity>> {
    const {
      page = 1,
      limit = 10,
      category,
      languageCode,
      isFeatured,
      sortBy,
      sortOrder,
    } = query;

    const qb = this.siteContentRepository.createQueryBuilder('content');

    qb.where('content.status = :status', { status: SiteContentStatus.PUBLISHED })
      .andWhere('(content.published_at IS NULL OR content.published_at <= :now)', { now: new Date() })
      .andWhere('content.deleted_at IS NULL');

    if (category) {
      qb.andWhere('content.category = :category', { category });
    }

    if (languageCode) {
      qb.andWhere('content.language_code = :languageCode', { languageCode });
    }

    if (typeof isFeatured === 'boolean') {
      qb.andWhere('content.is_featured = :isFeatured', { isFeatured });
    }

    this.applySorting(qb, sortBy, sortOrder);

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  }

  async getPublishedSiteContentBySlug(slug: string, languageCode?: string): Promise<SiteContentEntity | null> {
    const qb = this.siteContentRepository.createQueryBuilder('content');

    qb.where('content.slug = :slug', { slug })
      .andWhere('content.status = :status', { status: SiteContentStatus.PUBLISHED })
      .andWhere('(content.published_at IS NULL OR content.published_at <= :now)', { now: new Date() })
      .andWhere('content.deleted_at IS NULL');

    if (languageCode) {
      qb.andWhere('content.language_code = :languageCode', { languageCode });
    }

    qb.orderBy('content.published_at', 'DESC').addOrderBy('content.updated_at', 'DESC');

    return qb.getOne();
  }

  async getPublishedSiteContentByCode(code: string, languageCode?: string): Promise<SiteContentEntity | null> {
    const qb = this.siteContentRepository.createQueryBuilder('content');

    qb.where('content.code = :code', { code })
      .andWhere('content.status = :status', { status: SiteContentStatus.PUBLISHED })
      .andWhere('(content.published_at IS NULL OR content.published_at <= :now)', { now: new Date() })
      .andWhere('content.deleted_at IS NULL');

    if (languageCode) {
      qb.andWhere('content.language_code = :languageCode', { languageCode });
    }

    qb.orderBy('content.published_at', 'DESC').addOrderBy('content.updated_at', 'DESC');

    return qb.getOne();
  }

  private applySorting(
    qb: ReturnType<SiteContentRepository['createQueryBuilder']>,
    sortBy: ClientSiteContentListParams['sortBy'],
    sortOrder?: ClientSiteContentListParams['sortOrder'],
  ) {
    const orderDirection = sortOrder === 'asc' ? SortOrder.ASC : SortOrder.DESC;

    switch (sortBy) {
      case 'createdAt':
        qb.orderBy('content.created_at', orderDirection);
        break;
      case 'updatedAt':
        qb.orderBy('content.updated_at', orderDirection);
        break;
      case 'displayOrder':
        qb
          .orderBy('content.display_order', orderDirection)
          .addOrderBy('content.created_at', SortOrder.DESC);
        break;
      case 'publishedAt':
        qb
          .orderBy('content.published_at', orderDirection)
          .addOrderBy('content.display_order', SortOrder.ASC);
        break;
      default:
        qb
          .orderBy('content.display_order', SortOrder.ASC)
          .addOrderBy('content.published_at', SortOrder.DESC);
        break;
    }
  }
}
