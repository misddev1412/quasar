import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminTranslationService } from '../services/admin-translation.service';
import { ResponseService } from '../../shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';

const createTranslationSchema = z.object({
  key: z.string().min(1).max(255),
  locale: z.string().length(5),
  value: z.string(),
  namespace: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

const updateTranslationSchema = z.object({
  key: z.string().min(1).max(255).optional(),
  locale: z.string().length(5).optional(),
  value: z.string().optional(),
  namespace: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

const translationFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  locale: z.string().optional(),
  namespace: z.string().optional(),
  isActive: z.boolean().optional(),
});

@Router({ alias: 'adminTranslation' })
@Injectable()
export class AdminTranslationRouter {
  constructor(
    @Inject(AdminTranslationService)
    private readonly adminTranslationService: AdminTranslationService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: translationFiltersSchema,
    output: paginatedResponseSchema,
  })
  async getTranslations(
    @Input() filters: z.infer<typeof translationFiltersSchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.adminTranslationService.getTranslations(filters);
      const paginatedData = {
        items: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages
      };

      return this.responseHandler.createTrpcSuccess(paginatedData);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get translations'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getTranslationById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.adminTranslationService.getTranslationById(input.id);
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getLocales(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const locales = await this.adminTranslationService.getLocales();
      return this.responseHandler.createTrpcSuccess(locales);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get locales'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getNamespaces(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const namespaces = await this.adminTranslationService.getNamespaces();
      return this.responseHandler.createTrpcSuccess(namespaces);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get namespaces'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createTranslationSchema,
    output: apiResponseSchema,
  })
  async createTranslation(
    @Input() createTranslationDto: z.infer<typeof createTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.adminTranslationService.createTranslation(createTranslationDto as any);
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: updateTranslationSchema,
    }),
    output: apiResponseSchema,
  })
  async updateTranslation(
    @Input() input: { id: string; data: z.infer<typeof updateTranslationSchema> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.adminTranslationService.updateTranslation(input.id, input.data);
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteTranslation(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.adminTranslationService.deleteTranslation(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async toggleTranslationStatus(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.adminTranslationService.toggleTranslationStatus(input.id);
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.TRANSLATION
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to toggle translation status'
      );
    }
  }
}
