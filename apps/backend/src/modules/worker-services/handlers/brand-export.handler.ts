import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseExportHandler, ExportPageResult } from '@backend/modules/export/handlers/base-export.handler';
import { ExportHandlerRegistry } from '@backend/modules/export/services/export-handler.registry';
import { BrandRepository, BrandFindManyOptions } from '@backend/modules/products/repositories/brand.repository';
import { Brand } from '@backend/modules/products/entities/brand.entity';
import { BRAND_EXPORT_COLUMNS } from '@backend/modules/products/export/brand-export.columns';

@Injectable()
export class BrandExportHandler extends BaseExportHandler<Record<string, any>, Brand> implements OnModuleInit {
  readonly resource = 'brands';

  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly registry: ExportHandlerRegistry,
  ) {
    super();
  }

  onModuleInit(): void {
    this.registry.register(this);
  }

  getColumns() {
    return BRAND_EXPORT_COLUMNS;
  }

  private normalizeFilters(filters?: Record<string, any>): Pick<BrandFindManyOptions, 'search' | 'isActive'> {
    if (!filters) {
      return {};
    }

    const normalized: Pick<BrandFindManyOptions, 'search' | 'isActive'> = {};

    if (typeof filters.search === 'string' && filters.search.trim()) {
      normalized.search = filters.search.trim();
    }

    if (typeof filters.isActive === 'boolean') {
      normalized.isActive = filters.isActive;
    }

    return normalized;
  }

  async fetchPage(
    params: { page: number; limit: number },
    filters?: Record<string, any>,
  ): Promise<ExportPageResult<Brand>> {
    const normalizedFilters = this.normalizeFilters(filters);
    const result = await this.brandRepository.findMany({
      page: params.page,
      limit: params.limit,
      search: normalizedFilters.search,
      isActive: normalizedFilters.isActive,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });

    return {
      items: result.items as unknown as Brand[],
      total: result.total,
    };
  }

  transformRecord(record: Brand): Record<string, any> {
    const anyRecord = record as any;
    return {
      id: anyRecord.id,
      name: anyRecord.name,
      description: anyRecord.description,
      website: anyRecord.website,
      logo: anyRecord.logo,
      isActive: anyRecord.isActive,
      productCount: anyRecord.productCount ?? anyRecord.products?.length ?? 0,
      createdAt: anyRecord.createdAt,
      updatedAt: anyRecord.updatedAt,
    };
  }
}
