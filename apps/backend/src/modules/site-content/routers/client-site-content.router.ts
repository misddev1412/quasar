import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ClientSiteContentService } from '../services/client-site-content.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { SiteContentCategory } from '@shared/enums/site-content.enums';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { SiteContentEntity } from '../entities/site-content.entity';

const listSiteContentQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  category: z.nativeEnum(SiteContentCategory).optional(),
  languageCode: z.string().min(2).max(10).optional(),
  isFeatured: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'displayOrder']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const siteContentBySlugSchema = z.object({
  slug: z.string().min(1),
  languageCode: z.string().min(2).max(10).optional(),
});

const siteContentByCodeSchema = z.object({
  code: z.string().min(1),
  languageCode: z.string().min(2).max(10).optional(),
});

@Router({ alias: 'clientSiteContents' })
@Injectable()
export class ClientSiteContentRouter {
  constructor(
    private readonly clientSiteContentService: ClientSiteContentService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: listSiteContentQuerySchema,
    output: apiResponseSchema,
  })
  async listSiteContents(
    @Input() query: z.infer<typeof listSiteContentQuerySchema>,
  ) {
    try {
      const result = await this.clientSiteContentService.listPublishedSiteContents(query);

      return this.responseHandler.createTrpcSuccess({
        items: result.items.map((item) => this.formatSiteContent(item)),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1,
        },
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to retrieve site contents',
      );
    }
  }

  @Query({
    input: siteContentBySlugSchema,
    output: apiResponseSchema,
  })
  async getSiteContentBySlug(
    @Input() params: z.infer<typeof siteContentBySlugSchema>,
  ) {
    try {
      const siteContent = await this.clientSiteContentService.getPublishedSiteContentBySlug(
        params.slug,
        params.languageCode,
      );

      if (!siteContent) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Site content not found',
        );
      }

      return this.responseHandler.createTrpcSuccess({
        siteContent: this.formatSiteContent(siteContent),
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to retrieve site content',
      );
    }
  }

  @Query({
    input: siteContentByCodeSchema,
    output: apiResponseSchema,
  })
  async getSiteContentByCode(
    @Input() params: z.infer<typeof siteContentByCodeSchema>,
  ) {
    try {
      const siteContent = await this.clientSiteContentService.getPublishedSiteContentByCode(
        params.code,
        params.languageCode,
      );

      if (!siteContent) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Site content not found',
        );
      }

      return this.responseHandler.createTrpcSuccess({
        siteContent: this.formatSiteContent(siteContent),
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to retrieve site content',
      );
    }
  }

  private formatSiteContent(entity: SiteContentEntity) {
    return {
      id: entity.id,
      code: entity.code,
      title: entity.title,
      slug: entity.slug,
      category: entity.category,
      status: entity.status,
      summary: entity.summary ?? null,
      content: entity.content ?? null,
      languageCode: entity.languageCode,
      publishedAt: entity.publishedAt ? entity.publishedAt.toISOString() : null,
      metadata: entity.metadata ?? null,
      displayOrder: entity.displayOrder,
      isFeatured: entity.isFeatured,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
