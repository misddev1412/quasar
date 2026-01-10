import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { CategoryRepository } from '../../../modules/products/repositories/category.repository';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';

@Router({ alias: 'clientCategories' })
@Injectable()
export class ClientCategoriesRouter {
  constructor(
    @Inject(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) { }

  @Query({
    output: apiResponseSchema,
  })
  async getCategories(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const categories = await this.categoryRepository.findMany({
        page: 1,
        limit: 100,
        isActive: true,
        sortBy: 'sortOrder',
        sortOrder: 'ASC',
      });

      const formattedCategories = categories.items.map(category => this.formatCategoryForResponse(category));

      return this.responseHandler.createTrpcSuccess(formattedCategories);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.CATEGORIES
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve categories'
      );
    }
  }

  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getCategoryById(
    @Input() params: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id } = params;

      const category = await this.categoryRepository.findById(id, ['translations']);

      if (!category || !category.isActive) {
        throw new Error('Category not found');
      }

      const formattedCategory = this.formatCategoryForResponse(category);

      return this.responseHandler.createTrpcSuccess(formattedCategory);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.CATEGORIES
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve category'
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getCategoryTree(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const categoryTree = await this.categoryRepository.getCategoryTree(false); // Only active categories

      const formattedTree = this.formatCategoryTreeForResponse(categoryTree);

      return this.responseHandler.createTrpcSuccess(formattedTree);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.CATEGORIES
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve category tree'
      );
    }
  }

  @Query({
    input: z.object({ slug: z.string() }),
    output: apiResponseSchema,
  })
  async getCategoryBySlug(
    @Input() params: { slug: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { slug } = params;
      let category = null;

      // 1. Try to find by UUID if it looks like one
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(slug)) {
        category = await this.categoryRepository.findById(slug);
      }

      // 2. If not found by ID, try to find by slug
      if (!category) {
        category = await this.categoryRepository.findBySlugWithTranslation(slug);
      }

      // 3. Fallback: search by name (legacy behavior)
      if (!category) {
        const categories = await this.categoryRepository.findMany({
          page: 1,
          limit: 1,
          search: slug.replace(/-/g, ' '),
          isActive: true,
        });
        if (categories.items && categories.items.length > 0) {
          category = categories.items[0];
        }
      }

      if (!category) {
        throw new Error('Category not found');
      }

      const formattedCategory = this.formatCategoryForResponse(category);

      return this.responseHandler.createTrpcSuccess(formattedCategory);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.CATEGORIES
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve category'
      );
    }
  }

  @Query({
    input: z.object({ parentId: z.string().uuid().optional() }),
    output: apiResponseSchema,
  })
  async getRootCategories(
    @Input() params: { parentId?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { parentId } = params;

      let categories;
      if (parentId) {
        categories = await this.categoryRepository.getChildren(parentId, false);
      } else {
        categories = await this.categoryRepository.getRootCategories(false);
      }

      const formattedCategories = categories.map(category => this.formatCategoryForResponse(category));

      return this.responseHandler.createTrpcSuccess(formattedCategories);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.CATEGORIES
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve root categories'
      );
    }
  }

  private formatCategoryForResponse(category: any): any {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      image: category.image,
      heroBackgroundImage: category.heroBackgroundImage,
      heroOverlayEnabled: category.heroOverlayEnabled,
      heroOverlayColor: category.heroOverlayColor,
      heroOverlayOpacity: category.heroOverlayOpacity,
      showTitle: category.showTitle,
      showProductCount: category.showProductCount,
      showSubcategoryCount: category.showSubcategoryCount,
      showCta: category.showCta,
      ctaLabel: category.ctaLabel,
      ctaUrl: category.ctaUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      level: category.level,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: category.productCount || 0,
      translations: Array.isArray(category.translations) ? category.translations.map((translation: any) => ({
        id: translation.id,
        categoryId: translation.categoryId,
        locale: translation.locale,
        name: translation.name,
        description: translation.description,
        slug: translation.slug,
        seoTitle: translation.seoTitle,
        seoDescription: translation.seoDescription,
        metaKeywords: translation.metaKeywords,
      })) : [],
    };
  }

  private formatCategoryTreeForResponse(categories: any[]): any[] {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      level: category.level,
      sortOrder: category.sortOrder,
      productCount: category.productCount || 0,
      children: Array.isArray(category.children) ? this.formatCategoryTreeForResponse(category.children) : [],
    }));
  }
}
