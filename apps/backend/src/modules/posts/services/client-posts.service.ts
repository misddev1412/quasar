import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Post, PostStatus, PostType } from '../entities/post.entity';
import { PaginatedDto } from '@shared/classes/pagination.dto';

export interface ClientNewsFilters {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  isActive: boolean;
  sortBy: 'publishDate' | 'createdAt' | 'sortOrder';
  sortOrder: 'asc' | 'desc';
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsListResponse {
  items: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryItem {
  name: string;
  count: number;
}

@Injectable()
export class ClientPostsService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  private isUuid(value: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
  }

  async getNews(filters: ClientNewsFilters): Promise<NewsListResponse> {
    try {
      const { page, limit, category, search, isActive, sortBy, sortOrder } = filters;

      // Build query
      const queryBuilder = this.postRepository.createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.translations', 'translations')
        .leftJoinAndSelect('post.categories', 'categories')
        .where('post.type = :type', { type: PostType.NEWS })
        .andWhere('post.status = :status', { status: PostStatus.PUBLISHED });

      // Filter by active status
      if (isActive) {
        queryBuilder.andWhere('post.published_at <= :now', { now: new Date() });
      }

      // Filter by category
      const normalizedCategory = typeof category === 'string' ? category.trim() : '';
      if (normalizedCategory && normalizedCategory !== 'All') {
        if (this.isUuid(normalizedCategory)) {
          queryBuilder.andWhere('categories.id = :categoryId', { categoryId: normalizedCategory });
        } else {
          queryBuilder.andWhere('(LOWER(categories.name) = LOWER(:categoryName) OR LOWER(categories.slug) = LOWER(:categorySlug))', {
            categoryName: normalizedCategory,
            categorySlug: normalizedCategory,
          });
        }
      }

      // Search functionality
      if (search) {
        queryBuilder.andWhere(
          '(translations.title ILIKE :search OR translations.excerpt ILIKE :search OR translations.content ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Count total items
      const total = await queryBuilder.getCount();

      // Sorting
      switch (sortBy) {
        case 'publishDate':
          queryBuilder.orderBy('post.published_at', sortOrder.toUpperCase() as 'ASC' | 'DESC');
          break;
        case 'createdAt':
          queryBuilder.orderBy('post.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
          break;
        case 'sortOrder':
          // Sort by isFeatured first, then by published_at as fallback
          queryBuilder.orderBy('post.is_featured', sortOrder.toUpperCase() as 'ASC' | 'DESC')
            .addOrderBy('post.published_at', sortOrder.toUpperCase() as 'ASC' | 'DESC');
          break;
        default:
          queryBuilder.orderBy('post.published_at', 'DESC');
      }

      // Pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const posts = await queryBuilder.getMany();

      // Transform to news items format
      const newsItems: NewsItem[] = posts.map(post => {
        // Get the English translation or first available translation
        const translation = post.translations.find(t => t.locale === 'en') || post.translations[0];
        const categoryName = post.categories.length > 0 ? post.categories[0].name : 'Uncategorized';

        return {
          id: post.id,
          title: translation?.title || 'Untitled',
          slug: translation?.slug || post.id,
          excerpt: translation?.excerpt || '',
          content: translation?.content || '',
          author: post.author?.username || 'Anonymous',
          publishDate: post.published_at?.toISOString().split('T')[0] || post.createdAt.toISOString().split('T')[0],
          category: categoryName,
          image: post.featured_image || undefined,
          isActive: post.status === PostStatus.PUBLISHED && (!post.published_at || post.published_at <= new Date()),
          sortOrder: 0, // post doesn't have sortOrder field
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items: newsItems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error('ClientPostsService.getNews error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve news',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getNewsBySlug(slug: string): Promise<NewsItem | null> {
    try {
      const post = await this.postRepository.findBySlug(slug);

      if (!post || post.type !== PostType.NEWS || post.status !== PostStatus.PUBLISHED) {
        return null;
      }

      // Check if post is published
      if (post.published_at && post.published_at > new Date()) {
        return null;
      }

      // Get the English translation or first available translation
      const translation = post.translations.find(t => t.locale === 'en') || post.translations[0];
      const categoryName = post.categories.length > 0 ? post.categories[0].name : 'Uncategorized';

      return {
        id: post.id,
        title: translation?.title || 'Untitled',
        slug: translation?.slug || post.id,
        excerpt: translation?.excerpt || '',
        content: translation?.content || '',
        author: post.author?.username || 'Anonymous',
        publishDate: post.published_at?.toISOString().split('T')[0] || post.createdAt.toISOString().split('T')[0],
        category: categoryName,
        image: post.featured_image || undefined,
        isActive: post.status === PostStatus.PUBLISHED && (!post.published_at || post.published_at <= new Date()),
        sortOrder: 0, // post doesn't have sortOrder field
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    } catch (error) {
      console.error('ClientPostsService.getNewsBySlug error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve news article',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getNewsCategories(): Promise<CategoryItem[]> {
    try {
      const result = await this.postRepository.createQueryBuilder('post')
        .leftJoin('post.categories', 'categories')
        .leftJoin('post.translations', 'translations')
        .select('categories.name', 'name')
        .addSelect('COUNT(DISTINCT post.id)', 'count')
        .where('post.type = :type', { type: PostType.NEWS })
        .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
        .andWhere('post.published_at <= :now', { now: new Date() })
        .groupBy('categories.name')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Get total count for "All" category
      const totalCount = await this.postRepository.createQueryBuilder('post')
        .where('post.type = :type', { type: PostType.NEWS })
        .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
        .andWhere('post.published_at <= :now', { now: new Date() })
        .getCount();

      const categories: CategoryItem[] = [
        { name: 'All', count: totalCount },
        ...result.map(item => ({
          name: item.name || 'Uncategorized',
          count: parseInt(item.count) || 0,
        })),
      ];

      return categories;
    } catch (error) {
      console.error('ClientPostsService.getNewsCategories error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve news categories',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }
}
