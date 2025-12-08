import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminLanguageService } from '../services/admin-language.service';
import { ResponseService } from '../../shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';

const createLanguageSchema = z.object({
  code: z.string().min(2).max(10).transform(val => val.toLowerCase()),
  name: z.string().min(1).max(100),
  nativeName: z.string().min(1).max(100),
  icon: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateLanguageSchema = z.object({
  code: z.string().min(2).max(10).transform(val => val.toLowerCase()).optional(),
  name: z.string().min(1).max(100).optional(),
  nativeName: z.string().min(1).max(100).optional(),
  icon: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const languageFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateSortOrdersSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

@Router({ alias: 'adminLanguage' })
@Injectable()
export class AdminLanguageRouter {
  constructor(
    @Inject(AdminLanguageService)
    private readonly adminLanguageService: AdminLanguageService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: languageFiltersSchema,
    output: paginatedResponseSchema,
  })
  async getLanguages(
    @Input() filters: z.infer<typeof languageFiltersSchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.adminLanguageService.getLanguages(filters);
      // Transform the result structure to match the expected pagination format
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
        20, // ModuleCode.LANGUAGE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get languages'
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getActiveLanguages(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const languages = await this.adminLanguageService.getActiveLanguages();
      return this.responseHandler.createTrpcSuccess(languages);
    } catch (error) {
      // For this public endpoint, handle errors gracefully
      console.warn('Failed to get active languages:', error.message);
      return this.responseHandler.createTrpcSuccess([]);
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getLanguageById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const language = await this.adminLanguageService.getLanguageById(input.id);
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get language'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getDefaultLanguage(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const language = await this.adminLanguageService.getDefaultLanguage();
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get default language'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createLanguageSchema,
    output: apiResponseSchema,
  })
  async createLanguage(
    @Input() createLanguageDto: z.infer<typeof createLanguageSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const language = await this.adminLanguageService.createLanguage(createLanguageDto as any);
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create language'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: updateLanguageSchema,
    }),
    output: apiResponseSchema,
  })
  async updateLanguage(
    @Input() input: { id: string; data: z.infer<typeof updateLanguageSchema> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const language = await this.adminLanguageService.updateLanguage(input.id, input.data);
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update language'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteLanguage(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.adminLanguageService.deleteLanguage(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete language'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async setDefaultLanguage(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const language = await this.adminLanguageService.setDefaultLanguage(input.id);
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to set default language'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async toggleLanguageStatus(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const language = await this.adminLanguageService.toggleLanguageStatus(input.id);
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to toggle language status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateSortOrdersSchema,
    output: apiResponseSchema,
  })
  async updateSortOrders(
    @Input() input: z.infer<typeof updateSortOrdersSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.adminLanguageService.updateSortOrders(input.updates as any);
      return this.responseHandler.createTrpcSuccess({ updated: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.LANGUAGE
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update sort orders'
      );
    }
  }
}