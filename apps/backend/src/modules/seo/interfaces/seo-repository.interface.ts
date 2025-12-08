import { IBaseRepository } from '@shared';
import { SEOEntity } from '../entities/seo.entity';

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
} 