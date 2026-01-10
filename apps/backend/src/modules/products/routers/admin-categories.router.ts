import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { CategoryRepository } from '../repositories/category.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';

export const getCategoriesQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder', 'level']).default('level'),
  sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
});

export const getCategoryTreeSchema = z.object({
  includeInactive: z.boolean().default(false),
});

export const getFilteredCategoryTreeSchema = z.object({
  includeInactive: z.boolean().default(false),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional(),
});

export const getRootCategoriesSchema = z.object({
  includeInactive: z.boolean().default(false),
});

export const getCategoryChildrenSchema = z.object({
  parentId: z.string().uuid(),
  includeInactive: z.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
  image: z.string().optional(),
  heroBackgroundImage: z.string().optional(),
  heroOverlayEnabled: z.boolean().optional(),
  heroOverlayColor: z.string().optional(),
  heroOverlayOpacity: z.number().min(0).max(100).optional(),
  showTitle: z.boolean().optional(),
  showProductCount: z.boolean().optional(),
  showSubcategoryCount: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
  image: z.string().optional(),
  heroBackgroundImage: z.string().optional(),
  heroOverlayEnabled: z.boolean().optional(),
  heroOverlayColor: z.string().optional(),
  heroOverlayOpacity: z.number().min(0).max(100).optional(),
  showTitle: z.boolean().optional(),
  showProductCount: z.boolean().optional(),
  showSubcategoryCount: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
});

export const createCategoryTranslationSchema = z.object({
  categoryId: z.string().uuid(),
  locale: z.string().min(2).max(5),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  slug: z.string().min(1).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export const updateCategoryTranslationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  slug: z.string().min(1).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

@Router({ alias: 'adminProductCategories' })
@Injectable()
export class AdminProductCategoriesRouter {
  constructor(
    @Inject(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getCategoriesQuerySchema,
    output: paginatedResponseSchema,
  })
  async getAll(
    @Input() query: z.infer<typeof getCategoriesQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.categoryRepository.findMany(query);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve categories'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getCategoryTreeSchema,
    output: apiResponseSchema,
  })
  async getTree(
    @Input() query: z.infer<typeof getCategoryTreeSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const tree = await this.categoryRepository.getCategoryTree(query.includeInactive);
      return this.responseHandler.createTrpcSuccess(tree);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve category tree'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getRootCategoriesSchema,
    output: apiResponseSchema,
  })
  async getRootCategories(
    @Input() query: z.infer<typeof getRootCategoriesSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const rootCategories = await this.categoryRepository.getRootCategories(query.includeInactive);
      return this.responseHandler.createTrpcSuccess(rootCategories);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve root categories'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getCategoryChildrenSchema,
    output: apiResponseSchema,
  })
  async getCategoryChildren(
    @Input() query: z.infer<typeof getCategoryChildrenSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const children = await this.categoryRepository.getChildren(query.parentId, query.includeInactive);
      return this.responseHandler.createTrpcSuccess(children);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve category children'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getFilteredCategoryTreeSchema,
    output: apiResponseSchema,
  })
  async getFilteredTree(
    @Input() query: z.infer<typeof getFilteredCategoryTreeSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { includeInactive, ...filters } = query;
      const tree = await this.categoryRepository.getFilteredCategoryTree(filters, includeInactive);
      return this.responseHandler.createTrpcSuccess(tree);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve filtered category tree'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const category = await this.categoryRepository.findById(input.id);
      if (!category) {
        throw new Error('Category not found');
      }
      return this.responseHandler.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Category not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createCategorySchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createCategorySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const category = await this.categoryRepository.create(input);
      return this.responseHandler.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create category'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateCategorySchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateCategorySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const category = await this.categoryRepository.update(id, updateData);
      return this.responseHandler.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update category'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.categoryRepository.delete(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete category'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.categoryRepository.getStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve category statistics'
      );
    }
  }

  // Translation endpoints
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ 
      categoryId: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getCategoryTranslations(
    @Input() input: { categoryId: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (input.locale) {
        const translation = await this.categoryRepository.findCategoryTranslation(input.categoryId, input.locale);
        return this.responseHandler.createTrpcSuccess(translation);
      } else {
        const translations = await this.categoryRepository.findCategoryTranslations(input.categoryId);
        return this.responseHandler.createTrpcSuccess(translations);
      }
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve category translations'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ 
      id: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getByIdWithTranslations(
    @Input() input: { id: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const category = await this.categoryRepository.findByIdWithTranslations(input.id, input.locale);
      if (!category) {
        throw new Error('Category not found');
      }
      return this.responseHandler.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Category not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      locale: z.string().min(2).max(5).optional(),
      includeInactive: z.boolean().default(false),
    }),
    output: apiResponseSchema,
  })
  async getTreeWithTranslations(
    @Input() input: { locale?: string; includeInactive?: boolean }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const tree = await this.categoryRepository.getTreeWithTranslations(input.locale, input.includeInactive);
      return this.responseHandler.createTrpcSuccess(tree);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve category tree with translations'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createCategoryTranslationSchema,
    output: apiResponseSchema,
  })
  async createCategoryTranslation(
    @Input() input: z.infer<typeof createCategoryTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.categoryRepository.createCategoryTranslation({
        category_id: input.categoryId,
        locale: input.locale,
        name: input.name,
        description: input.description,
        slug: input.slug,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        metaKeywords: input.metaKeywords,
      });
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create category translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      categoryId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }).merge(updateCategoryTranslationSchema),
    output: apiResponseSchema,
  })
  async updateCategoryTranslation(
    @Input() input: { categoryId: string; locale: string } & z.infer<typeof updateCategoryTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { categoryId, locale, ...updateData } = input;
      const translation = await this.categoryRepository.updateCategoryTranslation(categoryId, locale, updateData);
      
      if (!translation) {
        throw this.responseHandler.createTRPCError(
          50, // ModuleCode.PRODUCT
          3,  // OperationCode.UPDATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Category translation not found'
        );
      }
      
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update category translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      categoryId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }),
    output: apiResponseSchema,
  })
  async deleteCategoryTranslation(
    @Input() input: { categoryId: string; locale: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.categoryRepository.deleteCategoryTranslation(input.categoryId, input.locale);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete category translation'
      );
    }
  }

}
