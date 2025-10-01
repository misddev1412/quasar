import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Ctx, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { ClientPostsService } from '../../../modules/posts/services/client-posts.service';
import { apiResponseSchema } from '../../schemas/response.schemas';

// Define schemas for news
const newsItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  author: z.string(),
  publishDate: z.string(),
  category: z.string(),
  image: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const newsListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  isActive: z.boolean().default(true),
  sortBy: z.enum(['publishDate', 'createdAt', 'sortOrder']).default('publishDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const newsListResponseSchema = z.object({
  items: z.array(newsItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

@Router({ alias: 'clientNews' })
@Injectable()
export class ClientNewsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    private readonly clientPostsService: ClientPostsService,
  ) {}

  @Query({
    input: newsListQuerySchema,
    output: apiResponseSchema,
  })
  async getNews(
    @Input() query: z.infer<typeof newsListQuerySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.clientPostsService.getNews({
        page: query.page,
        limit: query.limit,
        category: query.category,
        search: query.search,
        isActive: query.isActive,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.NEWS (assuming this would be added)
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve news'
      );
    }
  }

  @Query({
    input: z.object({ slug: z.string() }),
    output: apiResponseSchema,
  })
  async getNewsBySlug(
    @Input() params: { slug: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { slug } = params;
      const newsItem = await this.clientPostsService.getNewsBySlug(slug);

      if (!newsItem) {
        throw new Error('News article not found');
      }

      return this.responseHandler.createTrpcSuccess({
        news: newsItem,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.NEWS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve news article'
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getNewsCategories(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const categories = await this.clientPostsService.getNewsCategories();
      return this.responseHandler.createTrpcSuccess({ categories });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.NEWS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve news categories'
      );
    }
  }
}