import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseExportHandler, ExportPageResult } from '../../export/handlers/base-export.handler';
import { ExportHandlerRegistry } from '../../export/services/export-handler.registry';
import { ProductRepository, ProductFilters } from '../../products/repositories/product.repository';
import { Product } from '../../products/entities/product.entity';
import { PRODUCT_EXPORT_COLUMNS } from '../../products/export/product-export.columns';

@Injectable()
export class ProductExportHandler extends BaseExportHandler<Record<string, any>, Product> implements OnModuleInit {
  readonly resource = 'products';

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly registry: ExportHandlerRegistry,
  ) {
    super();
  }

  onModuleInit(): void {
    this.registry.register(this);
  }

  getColumns() {
    return PRODUCT_EXPORT_COLUMNS;
  }

  private normalizeFilters(filters?: Record<string, any>): ProductFilters {
    if (!filters) {
      return {};
    }

    const normalized: ProductFilters = {};

    if (typeof filters.search === 'string' && filters.search.trim()) {
      normalized.search = filters.search.trim();
    }

    if (typeof filters.brandId === 'string' && filters.brandId.trim()) {
      normalized.brandId = filters.brandId.trim();
    }

    if (Array.isArray(filters.categoryIds)) {
      normalized.categoryIds = filters.categoryIds.filter((value) => typeof value === 'string' && value.trim().length);
    }

    if (filters.status && typeof filters.status === 'string') {
      normalized.status = filters.status as any;
    }

    if (typeof filters.isActive === 'boolean') {
      normalized.isActive = filters.isActive;
    }

    if (typeof filters.isFeatured === 'boolean') {
      normalized.isFeatured = filters.isFeatured;
    }

    if (typeof filters.hasStock === 'boolean') {
      normalized.hasStock = filters.hasStock;
    }

    if (typeof filters.minPrice === 'number') {
      normalized.minPrice = filters.minPrice;
    }

    if (typeof filters.maxPrice === 'number') {
      normalized.maxPrice = filters.maxPrice;
    }

    if (typeof filters.createdFrom === 'string' && filters.createdFrom.trim()) {
      normalized.createdFrom = filters.createdFrom;
    }

    if (typeof filters.createdTo === 'string' && filters.createdTo.trim()) {
      normalized.createdTo = filters.createdTo;
    }

    return normalized;
  }

  async fetchPage(
    params: { page: number; limit: number },
    filters?: Record<string, any>,
  ): Promise<ExportPageResult<Product>> {
    const normalizedFilters = this.normalizeFilters(filters);
    const result = await this.productRepository.findAll({
      page: params.page,
      limit: params.limit,
      filters: normalizedFilters,
      relations: ['brand', 'productCategories', 'productCategories.category', 'variants'],
    });

    const items = await Promise.all(
      result.items.map(async (item) => {
        const brandRelation = (item as any).brand;
        if (brandRelation && typeof brandRelation.then === 'function') {
          (item as any).brand = await brandRelation;
        }
        return item;
      }),
    );

    return {
      items,
      total: result.total,
    };
  }

  transformRecord(product: Product): Record<string, any> {
    const variants = Array.isArray((product as any).variants) ? (product as any).variants : [];
    const variantPrices = variants
      .map((variant: any) => Number(variant.price))
      .filter((price: number) => Number.isFinite(price));

    const minPrice = variantPrices.length ? Math.min(...variantPrices) : undefined;
    const maxPrice = variantPrices.length ? Math.max(...variantPrices) : undefined;
    const priceRange =
      minPrice !== undefined && maxPrice !== undefined
        ? minPrice === maxPrice
          ? minPrice
          : `${minPrice} - ${maxPrice}`
        : undefined;

    const categoryNames = Array.isArray((product as any).productCategories)
      ? (product as any).productCategories
          .map((pc: any) => pc.category?.name)
          .filter(Boolean)
          .join(', ')
      : undefined;

    const brandName = (product as any).brand?.name ?? undefined;

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      priceRange,
      variantCount: variants.length,
      brand: brandName,
      categories: categoryNames,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
