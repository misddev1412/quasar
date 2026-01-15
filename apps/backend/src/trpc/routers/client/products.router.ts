import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Ctx, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ProductRepository } from '../../../modules/products/repositories/product.repository';
import { CategoryRepository } from '../../../modules/products/repositories/category.repository';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import {
  productListQuerySchema,
  productListResponseSchema,
  productDetailResponseSchema
} from '../../schemas/product.schemas';
import { ProductStatus } from '@backend/modules/products/entities/product.entity';
import { AdminCurrencyService } from '../../../modules/products/services/admin-currency.service';
import { AuthenticatedContext } from '../../context';
import { SupportedLocale } from '@shared';

@Router({ alias: 'clientProducts' })
@Injectable()
export class ClientProductsRouter {
  constructor(
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
    @Inject(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminCurrencyService)
    private readonly currencyService: AdminCurrencyService,
  ) { }

  private isUuid(value: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
  }

  private normalizeCategoryReference(value?: string): string | undefined {
    if (!value || typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private async resolveCategoryId(categoryRef?: string): Promise<string | undefined> {
    const normalized = this.normalizeCategoryReference(categoryRef);
    if (!normalized) {
      return undefined;
    }

    if (this.isUuid(normalized)) {
      return normalized;
    }

    try {
      const categoryBySlug = await this.categoryRepository.findBySlugWithTranslation(normalized);
      if (categoryBySlug?.id) {
        return categoryBySlug.id;
      }

      const categoryByName = await this.categoryRepository.findByName(normalized);
      if (categoryByName?.id) {
        return categoryByName.id;
      }
    } catch (error) {
      // Swallow lookup errors and fall through to undefined
    }

    return undefined;
  }

  @Query({
    input: productListQuerySchema,
    output: apiResponseSchema,
  })
  async getProducts(
    @Ctx() ctx: AuthenticatedContext,
    @Input() query: z.infer<typeof productListQuerySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { page, limit, search, category, brand, minPrice, maxPrice, status, isActive, isFeatured, sortBy, sortOrder } = query;

      // Build filters object
      const filters: any = {
        page,
        limit,
        search,
        status,
        isActive,
        isFeatured,
        minPrice,
        maxPrice,
      };

      // Add category filter if provided
      const resolvedCategoryId = await this.resolveCategoryId(category);
      if (resolvedCategoryId) {
        filters.categoryIds = [resolvedCategoryId];
      }

      // Add brand filter if provided
      if (brand) {
        filters.brandId = brand;
      }

      // Get products with filters
      const result = await this.productRepository.findAll({
        page,
        limit,
        filters,
        relations: [
          'brand',
          'supplier',
          'warranty',
          'variants',
          'variants.variantItems',
          'variants.variantItems.attribute',
          'variants.variantItems.attributeValue',
          'media',
          'tags',
          'productCategories',
          'productCategories.category',
          'specifications',
          'translations',
        ],
      });

      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const fallbackLocale = this.getFallbackLocale(ctx.locale);
      const formattedResult = {
        items: result.items.map(product =>
          this.formatProductForResponse(product, formatter, currencyCode, ctx.locale, fallbackLocale)
        ),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      return this.responseHandler.createTrpcSuccess(formattedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve products'
      );
    }
  }

  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getProductById(
    @Ctx() ctx: AuthenticatedContext,
    @Input() params: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id } = params;

      const product = await this.productRepository.findById(id, [
        'brand',
        'supplier',
        'warranty',
        'variants',
        'variants.variantItems',
        'variants.variantItems.attribute',
        'variants.variantItems.attributeValue',
        'media',
        'tags',
        'productCategories',
        'productCategories.category',
        'specifications',
        'translations',
      ]);

      if (!product) {
        throw new Error('Product not found');
      }

      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const fallbackLocale = this.getFallbackLocale(ctx.locale);
      const formattedProduct = this.formatProductForResponse(product, formatter, currencyCode, ctx.locale, fallbackLocale);

      return this.responseHandler.createTrpcSuccess({
        product: formattedProduct,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve product'
      );
    }
  }

  @Query({
    input: z.object({ slug: z.string() }),
    output: apiResponseSchema,
  })
  async getProductBySlug(
    @Ctx() ctx: AuthenticatedContext,
    @Input() params: { slug: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { slug } = params;

      const relations = [
        'brand',
        'supplier',
        'warranty',
        'variants',
        'variants.variantItems',
        'variants.variantItems.attribute',
        'variants.variantItems.attributeValue',
        'media',
        'tags',
        'productCategories',
        'productCategories.category',
        'specifications',
        'translations',
      ];

      const product = await this.productRepository.findBySlug(slug, relations, ctx.locale, this.getFallbackLocale(ctx.locale));

      if (!product) {
        throw new Error('Product not found');
      }

      const slugLocale = this.detectLocaleFromSlug(product, slug);
      const effectiveLocale = slugLocale ?? ctx.locale;
      const fallbackLocale = this.getFallbackLocale(effectiveLocale);
      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const formattedProduct = this.formatProductForResponse(
        product,
        formatter,
        currencyCode,
        effectiveLocale,
        fallbackLocale,
      );

      return this.responseHandler.createTrpcSuccess({
        product: formattedProduct,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve product'
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getNewProducts(
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.productRepository.findAll({
        page: 1,
        limit: 12,
        filters: {
          isActive: true,
          status: ProductStatus.ACTIVE,
        },
        relations: [
          'brand',
          'supplier',
          'warranty',
          'variants',
          'variants.variantItems',
          'variants.variantItems.attribute',
          'variants.variantItems.attributeValue',
          'media',
          'tags',
          'productCategories',
          'productCategories.category',
          'specifications',
          'translations',
        ],
      });

      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const fallbackLocale = this.getFallbackLocale(ctx.locale);
      const formattedResult = {
        items: result.items.map(product =>
          this.formatProductForResponse(product, formatter, currencyCode, ctx.locale, fallbackLocale)
        ),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      return this.responseHandler.createTrpcSuccess(formattedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve new products'
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getFeaturedProducts(
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.productRepository.findAll({
        page: 1,
        limit: 12,
        filters: {
          isFeatured: true,
          isActive: true,
          status: ProductStatus.ACTIVE,
        },
        relations: [
          'brand',
          'supplier',
          'warranty',
          'variants',
          'variants.variantItems',
          'variants.variantItems.attribute',
          'variants.variantItems.attributeValue',
          'media',
          'tags',
          'productCategories',
          'productCategories.category',
          'specifications',
          'translations',
        ],
      });

      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const fallbackLocale = this.getFallbackLocale(ctx.locale);
      const formattedResult = {
        items: result.items.map(product =>
          this.formatProductForResponse(product, formatter, currencyCode, ctx.locale, fallbackLocale)
        ),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      return this.responseHandler.createTrpcSuccess(formattedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve featured products'
      );
    }
  }

  @Query({
    input: z.object({
      ids: z.array(z.string().uuid()).min(1),
    }),
    output: apiResponseSchema,
  })
  async getProductsByIds(
    @Ctx() ctx: AuthenticatedContext,
    @Input() input: { ids: string[] }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const products = await this.productRepository.findByIds(input.ids, [
        'brand',
        'variants',
        'variants.variantItems',
        'variants.variantItems.attribute',
        'variants.variantItems.attributeValue',
        'media',
        'translations',
      ]);

      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const fallbackLocale = this.getFallbackLocale(ctx.locale);
      const formattedProducts = products.map((product) =>
        this.formatProductForResponse(product, formatter, currencyCode, ctx.locale, fallbackLocale)
      );

      return this.responseHandler.createTrpcSuccess({ items: formattedProducts });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve products'
      );
    }
  }

  @Query({
    input: z.object({
      categoryId: z.string().optional(),
      strategy: z.enum(['latest', 'featured', 'bestsellers', 'custom']).optional(),
    }),
    output: apiResponseSchema,
  })
  async getProductsByCategory(
    @Ctx() ctx: AuthenticatedContext,
    @Input() params: { categoryId?: string; strategy?: 'latest' | 'featured' | 'bestsellers' | 'custom' }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { categoryId, strategy } = params;
      const resolvedCategoryId = await this.resolveCategoryId(categoryId);

      const filters: any = {
        isActive: true,
        status: ProductStatus.ACTIVE,
      };

      if (strategy === 'bestsellers') {
        return this.responseHandler.createTrpcSuccess({
          items: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
          },
        });
      }

      if (resolvedCategoryId) {
        if (strategy !== 'custom') {
          filters.categoryIds = [resolvedCategoryId];
        }
      } else if (strategy !== 'custom' && this.normalizeCategoryReference(categoryId)) {
        return this.responseHandler.createTrpcSuccess({
          items: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
          },
        });
      }

      if (strategy === 'featured') {
        filters.isFeatured = true;
      }

      const result = await this.productRepository.findAll({
        page: 1,
        limit: 50,
        filters,
        relations: [
          'brand',
          // 'supplier', // Not needed for list view
          // 'warranty', // Not needed for list view
          'variants',
          'variants.variantItems',
          'variants.variantItems.attribute',
          'variants.variantItems.attributeValue',
          'media',
          // 'tags', // Not needed for list view
          'productCategories',
          'productCategories.category',
          // 'specifications', // Not needed for list view
          'translations',
        ],
      });

      const { formatter, currencyCode } = await this.resolveCurrencyFormat();
      const fallbackLocale = this.getFallbackLocale(ctx.locale);
      const formattedResult = {
        items: result.items.map(product =>
          this.formatProductForResponse(product, formatter, currencyCode, ctx.locale, fallbackLocale)
        ),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      return this.responseHandler.createTrpcSuccess(formattedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve products by category'
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getProductFilters(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.productRepository.findAll({
        page: 1,
        limit: 1000,
        filters: {
          isActive: true,
          status: ProductStatus.ACTIVE,
        },
        relations: ['brand', 'variants', 'productCategories', 'productCategories.category', 'specifications'],
      });

      const categories = new Map<string, { id: string; name: string; count: number }>();
      let minPrice = Infinity;
      let maxPrice = 0;
      const brands = new Map<string, { id: string; name: string; count: number }>();

      for (const product of result.items) {
        // Handle variants - they should be already loaded due to eager loading
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          for (const variant of product.variants) {
            if (variant.price && variant.isActive) {
              minPrice = Math.min(minPrice, variant.price);
              maxPrice = Math.max(maxPrice, variant.price);
            }
          }
        }

        // Handle product categories - already loaded
        if (product.productCategories && Array.isArray(product.productCategories) && product.productCategories.length > 0) {
          for (const pc of product.productCategories) {
            if (pc.category) {
              const categoryId = pc.category.id;
              const existing = categories.get(categoryId);
              if (existing) {
                existing.count++;
              } else {
                categories.set(categoryId, {
                  id: categoryId,
                  name: pc.category.name,
                  count: 1,
                });
              }
            }
          }
        }

        // Handle brand - need to await the promise
        try {
          const brand = await product.brand;
          if (brand) {
            const brandId = brand.id;
            const existing = brands.get(brandId);
            if (existing) {
              existing.count++;
            } else {
              brands.set(brandId, {
                id: brandId,
                name: brand.name,
                count: 1,
              });
            }
          }
        } catch (error) {
          // Skip if brand fails to load
          console.warn('Failed to load brand for product:', product.id);
        }
      }

      const formattedFilters = {
        categories: Array.from(categories.values()).sort((a, b) => a.name.localeCompare(b.name)),
        brands: Array.from(brands.values()).sort((a, b) => a.name.localeCompare(b.name)),
        priceRange: {
          min: minPrice === Infinity ? 0 : Math.floor(minPrice),
          max: Math.ceil(maxPrice),
        },
      };

      return this.responseHandler.createTrpcSuccess(formattedFilters);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve product filters'
      );
    }
  }

  private async resolveCurrencyFormat() {
    try {
      const currency = await this.currencyService.getDefaultCurrency();
      const currencyCode = currency?.code || 'USD';
      return {
        formatter: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
        }),
        currencyCode,
      };
    } catch (error) {
      console.warn('Failed to load default currency, falling back to USD:', error);
      return {
        formatter: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
        currencyCode: 'USD',
      };
    }
  }

  private formatProductForResponse(
    product: any,
    currencyFormatter: Intl.NumberFormat,
    currencyCode: string,
    locale?: SupportedLocale,
    fallbackLocale?: SupportedLocale,
  ): any {
    const rawTranslations = Array.isArray(product.translations)
      ? product.translations
      : Array.isArray((product as any).__translations__)
        ? (product as any).__translations__
        : [];
    const resolvedTranslation = this.resolveProductTranslation(rawTranslations, locale, fallbackLocale);
    const resolvedName = resolvedTranslation?.name ?? product.name;
    const resolvedDescription = resolvedTranslation?.description ?? product.description;
    const resolvedSlug = resolvedTranslation?.slug ?? product.slug ?? product.id;
    const resolvedMetaTitle = resolvedTranslation?.metaTitle ?? product.metaTitle;
    const resolvedMetaDescription = resolvedTranslation?.metaDescription ?? product.metaDescription;
    const resolvedMetaKeywords = resolvedTranslation?.metaKeywords ?? product.metaKeywords;
    const normalizedTranslations = rawTranslations.map((translation: any) => ({
      id: translation.id,
      locale: translation.locale,
      name: translation.name,
      description: translation.description,
      slug: translation.slug,
      metaTitle: translation.metaTitle,
      metaDescription: translation.metaDescription,
      metaKeywords: translation.metaKeywords,
    }));
    const tags = Array.isArray(product.tags)
      ? product.tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      }))
      : [];

    const variants = Array.isArray(product.variants)
      ? product.variants.map((variant: any) => {
        const variantItems = Array.isArray(variant.variantItems)
          ? variant.variantItems
            .map((item: any) => {
              const attributeId = item.attributeId || item.attribute?.id || null;
              const attributeValueId = item.attributeValueId || item.attributeValue?.id || null;

              return {
                id: item.id,
                attributeId,
                attributeValueId,
                sortOrder: item.sortOrder ?? 0,
                attribute: item.attribute
                  ? {
                    id: item.attribute.id,
                    name: item.attribute.name,
                    displayName: item.attribute.displayName,
                    type: item.attribute.type,
                  }
                  : undefined,
                attributeValue: item.attributeValue
                  ? {
                    id: item.attributeValue.id,
                    value: item.attributeValue.value,
                    displayValue: item.attributeValue.displayValue,
                  }
                  : undefined,
              };
            })
            .filter((item: any) => Boolean(item.attributeId && item.attributeValueId))
          : [];

        const attributeSelections: Record<string, string> = {};
        variantItems.forEach((item: any) => {
          if (item.attributeId && item.attributeValueId) {
            attributeSelections[item.attributeId] = item.attributeValueId;
          }
        });

        return {
          id: variant.id,
          productId: product.id,
          sku: variant.sku,
          name: variant.name,
          price: Number(variant.price) || 0,
          compareAtPrice: variant.compareAtPrice ?? variant.comparePrice ?? null,
          costPrice: variant.costPrice ?? null,
          stockQuantity: Number(variant.stockQuantity) || 0,
          weight: variant.weight ?? null,
          dimensions: variant.dimensions ?? null,
          isActive: variant.isActive,
          sortOrder: variant.sortOrder ?? 0,
          trackInventory: variant.trackInventory ?? false,
          allowBackorders: variant.allowBackorders ?? false,
          attributes: attributeSelections,
          variantItems,
        };
      })
      : [];

    const media = Array.isArray(product.media)
      ? product.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type,
        altText: media.altText,
        isPrimary: media.isPrimary,
        isImage: media.isImage,
        sortOrder: media.sortOrder,
      }))
      : [];

    const imageUrls = media
      .filter((m) => m.isImage)
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      })
      .map((m) => m.url);

    const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null;
    const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0);
    const prices = variants.map((v) => v.price).filter((price) => Number.isFinite(price));
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : null;
    let priceRange: string | null = null;
    if (lowestPrice != null && highestPrice != null) {
      priceRange = lowestPrice === highestPrice
        ? currencyFormatter.format(lowestPrice)
        : `${currencyFormatter.format(lowestPrice)} - ${currencyFormatter.format(highestPrice)}`;
    }

    const categories = Array.isArray(product.productCategories)
      ? product.productCategories.map((pc: any) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
        description: pc.category.description,
        parentId: pc.category.parentId,
      }))
      : [];

    const specifications = Array.isArray(product.specifications)
      ? product.specifications
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((spec: any) => ({
          id: spec.id,
          name: spec.name,
          value: spec.value,
          sortOrder: spec.sortOrder ?? 0,
        }))
      : [];

    return {
      id: product.id,
      name: resolvedName,
      slug: resolvedSlug,
      description: resolvedDescription,
      sku: product.sku,
      status: product.status,
      brandId: product.brandId,
      supplierId: product.supplierId,
      warrantyId: product.warrantyId,
      images: product.images,
      metaTitle: resolvedMetaTitle,
      metaDescription: resolvedMetaDescription,
      metaKeywords: resolvedMetaKeywords,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      brand: product.brand
        ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          logo: product.brand.logo,
          description: product.brand.description,
        }
        : undefined,
      supplier: product.supplier
        ? {
          id: product.supplier.id,
          name: product.supplier.name,
          email: product.supplier.email,
          phone: product.supplier.phone,
          address: product.supplier.address,
        }
        : undefined,
      warranty: product.warranty
        ? {
          id: product.warranty.id,
          name: product.warranty.name,
          duration: product.warranty.duration,
          description: product.warranty.description,
        }
        : undefined,
      tags,
      variants,
      media,
      categories,
      specifications,
      primaryImage,
      imageUrls,
      totalStock,
      lowestPrice,
      highestPrice,
      priceRange,
      currencyCode,
      price: lowestPrice ?? product.price ?? 0,
      translations: normalizedTranslations,
      hasVariants: variants.length > 1,
      variantCount: variants.length,
    };
  }

  private normalizeLocaleCode(value?: string | null): SupportedLocale | undefined {
    if (!value || typeof value !== 'string') {
      return undefined;
    }
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    const [base] = normalized.split(/[-_]/);
    if (base === 'vi' || base === 'en') {
      return base as SupportedLocale;
    }
    return undefined;
  }

  private detectLocaleFromSlug(product: any, slug: string): SupportedLocale | undefined {
    if (!product || !slug) {
      return undefined;
    }

    const normalizedSlug = slug.trim().toLowerCase();
    if (!normalizedSlug) {
      return undefined;
    }

    const translations = Array.isArray(product.translations)
      ? product.translations
      : Array.isArray((product as any)?.__translations__)
        ? (product as any).__translations__
        : [];

    if (!Array.isArray(translations) || translations.length === 0) {
      return undefined;
    }

    const matchedTranslation = translations.find((translation: any) => {
      if (!translation || typeof translation.slug !== 'string') {
        return false;
      }
      return translation.slug.trim().toLowerCase() === normalizedSlug;
    });

    return this.normalizeLocaleCode(matchedTranslation?.locale);
  }

  private getFallbackLocale(locale: SupportedLocale): SupportedLocale {
    return locale === 'vi' ? 'en' : 'vi';
  }

  private resolveProductTranslation(
    translations: any[],
    locale?: SupportedLocale,
    fallbackLocale?: SupportedLocale,
  ) {
    if (!Array.isArray(translations) || translations.length === 0) {
      return null;
    }

    if (locale) {
      const localeMatch = translations.find((translation) => translation.locale === locale);
      if (localeMatch) {
        return localeMatch;
      }
    }

    if (fallbackLocale) {
      const fallbackMatch = translations.find((translation) => translation.locale === fallbackLocale);
      if (fallbackMatch) {
        return fallbackMatch;
      }
    }

    return translations[0];
  }
}
