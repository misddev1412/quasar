import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { SiteContentRepository, SiteContentListParams } from '../repositories/site-content.repository';
import {
  CreateSiteContentDto,
  ListSiteContentQueryDto,
  UpdateSiteContentDto,
} from '../dto/site-content.dto';
import { PaginatedDto } from '@shared/classes/pagination.dto';
import { SiteContentEntity } from '../entities/site-content.entity';
import { SortOrder } from '@shared/enums/common.enums';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

@Injectable()
export class AdminSiteContentService {
  constructor(
    private readonly siteContentRepository: SiteContentRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async listSiteContents(query: ListSiteContentQueryDto): Promise<PaginatedDto<SiteContentEntity>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        status,
        languageCode,
        isFeatured,
        fromPublishedAt,
        toPublishedAt,
        sortBy,
        sortOrder,
      } = query;

      const filters: SiteContentListParams = {
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
        sortOrder: sortOrder === 'asc' ? SortOrder.ASC : SortOrder.DESC,
      };

      const result = await this.siteContentRepository.listWithFilters(filters);

      return {
        items: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
      };
    } catch (error) {
      console.error('AdminSiteContentService.listSiteContents error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve site contents',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  async getSiteContentById(id: string): Promise<SiteContentEntity | null> {
    try {
      return await this.siteContentRepository.findById(id);
    } catch (error) {
      console.error('AdminSiteContentService.getSiteContentById error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve site content',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  async createSiteContent(payload: CreateSiteContentDto): Promise<SiteContentEntity> {
    try {
      const existingByCode = await this.siteContentRepository.findByCode(payload.code);
      if (existingByCode) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.CREATE,
          ErrorLevelCode.CONFLICT,
          'Site content code already exists',
        );
      }

      const existingBySlug = await this.siteContentRepository.findBySlug(payload.slug);
      if (existingBySlug) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.CREATE,
          ErrorLevelCode.CONFLICT,
          'Site content slug already exists',
        );
      }

      const entity = this.siteContentRepository.create({
        ...payload,
        metadata: payload.metadata ?? undefined,
        publishedAt: payload.publishedAt ?? undefined,
        isFeatured: payload.isFeatured ?? false,
      });

      return await this.siteContentRepository.save(entity);
    } catch (error) {
      console.error('AdminSiteContentService.createSiteContent error:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw this.responseHandler.createError(
        500,
        'Failed to create site content',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  async updateSiteContent(id: string, payload: UpdateSiteContentDto): Promise<SiteContentEntity | null> {
    try {
      const existing = await this.siteContentRepository.findById(id);
      if (!existing) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.UPDATE,
          ErrorLevelCode.NOT_FOUND,
          'Site content not found',
        );
      }

      if (payload.code && payload.code !== existing.code) {
        const duplicateCode = await this.siteContentRepository.findByCode(payload.code);
        if (duplicateCode) {
          throw this.responseHandler.createTRPCError(
            ModuleCode.PAGE,
            OperationCode.UPDATE,
            ErrorLevelCode.CONFLICT,
            'Site content code already exists',
          );
        }
      }

      if (payload.slug && payload.slug !== existing.slug) {
        const duplicateSlug = await this.siteContentRepository.findBySlug(payload.slug);
        if (duplicateSlug) {
          throw this.responseHandler.createTRPCError(
            ModuleCode.PAGE,
            OperationCode.UPDATE,
            ErrorLevelCode.CONFLICT,
            'Site content slug already exists',
          );
        }
      }

      const updatePayload: Partial<SiteContentEntity> = {
        ...payload,
        metadata: payload.metadata === null ? null : payload.metadata ?? existing.metadata,
        publishedAt: payload.publishedAt === null ? null : payload.publishedAt ?? existing.publishedAt,
      };

      return await this.siteContentRepository.update(id, updatePayload);
    } catch (error) {
      console.error('AdminSiteContentService.updateSiteContent error:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw this.responseHandler.createError(
        500,
        'Failed to update site content',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  async deleteSiteContent(id: string): Promise<boolean> {
    try {
      return await this.siteContentRepository.softDelete(id);
    } catch (error) {
      console.error('AdminSiteContentService.deleteSiteContent error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to delete site content',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  async bulkDeleteSiteContents(ids: string[]): Promise<number> {
    try {
      return await this.siteContentRepository.softDeleteMultiple(ids);
    } catch (error) {
      console.error('AdminSiteContentService.bulkDeleteSiteContents error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to delete site contents',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }
}
