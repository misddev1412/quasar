import { IBaseRepository } from '@shared';
import { SEOEntity } from '@backend/modules/seo/entities/seo.entity';
import type { AdminSeoListQueryDto, AdminSeoStatsDto } from '@backend/modules/seo/dto/seo.dto';

export interface SEORepositoryInterface extends IBaseRepository<SEOEntity> {
  /**
   * Find SEO data by path
   * @param path Page path
   */
  findByPath(path: string): Promise<SEOEntity | null>;

  /**
   * Check if SEO data exists for a path
   * @param path Page path
   */
  existsByPath(path: string): Promise<boolean>;

  findAllPaginated(query: AdminSeoListQueryDto): Promise<{
    items: SEOEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  findStats(): Promise<AdminSeoStatsDto>;
}
