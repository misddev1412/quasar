import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseExportHandler, ExportPageResult } from '@backend/modules/export/handlers/base-export.handler';
import { ExportHandlerRegistry } from '@backend/modules/export/services/export-handler.registry';
import { BrandRepository, BrandFindManyOptions } from '@backend/modules/products/repositories/brand.repository';
import { Brand } from '@backend/modules/products/entities/brand.entity';
import { BRAND_TEMPLATE_EXPORT_COLUMNS } from '@backend/modules/products/export/brand-export.columns';
import * as XLSX from 'xlsx';

@Injectable()
export class BrandTemplateExportHandler extends BaseExportHandler<Record<string, any>, Brand> implements OnModuleInit {
  readonly resource = 'brand_import_template';

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
    return BRAND_TEMPLATE_EXPORT_COLUMNS;
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
      sortOrder: anyRecord.sortOrder,
    };
  }

  async generateCustomFile(
    payload: { filters?: Record<string, any>; options?: any; columns?: any; format?: string; resource: string },
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string; totalRecords: number }> {
    const columns = this.resolveColumns(payload.columns);
    const headers = columns.map(col => col.label || col.key);

    const allRows: Array<Record<string, any>> = [];
    const allTranslations: Array<Record<string, any>> = [];

    let page = 1;
    const pageSize = 500;
    const normalizedFilters = this.normalizeFilters(payload.filters);

    while (true) {
      const result = await this.brandRepository.findAll({
        page,
        limit: pageSize,
        filters: normalizedFilters,
        relations: ['translations'],
      });

      if (!result.items.length) {
        break;
      }

      for (const brand of result.items as any[]) {
        allRows.push(this.transformRecord(brand));

        if (brand.translations && brand.translations.length > 0) {
          for (const t of brand.translations) {
            allTranslations.push({
              'Brand ID': brand.id,
              'Locale': t.locale,
              'Name': t.name,
              'Description': t.description,
            });
          }
        }
      }

      if (result.items.length < pageSize) {
        break;
      }

      page += 1;
    }

    const workbook = XLSX.utils.book_new();

    const templateData = allRows.map(row => {
      const mapped: Record<string, any> = {};
      columns.forEach(col => {
        mapped[col.label || col.key] = row[col.key];
      });
      return mapped;
    });

    const templateSheet = XLSX.utils.json_to_sheet(templateData, { header: headers });
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

    const instructionsData = [
      ['Brand Import Instructions'],
      [''],
      ['1. BASIC INFO'],
      ['- Brand ID: UUID (leave empty for new, fill to update)'],
      ['- Name: Brand name (Required)'],
      ['- Is Active: true/false'],
      ['- Sort Order: number (0, 1, 2...)'],
      [''],
      ['2. TRANSLATIONS SHEET'],
      ['- Brand ID: UUID of the brand (Required)'],
      ['- Locale: en, vi, ...'],
      ['- Translatable fields: Name, Description'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    const translationHeaders = ['Brand ID', 'Locale', 'Name', 'Description'];
    const translationsSheet = XLSX.utils.json_to_sheet(allTranslations, { header: translationHeaders });
    XLSX.utils.book_append_sheet(workbook, translationsSheet, 'Translations');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const fileName = payload.options?.fileName || `brand-import-template-${new Date().toISOString().split('T')[0]}.xlsx`;

    return {
      buffer,
      fileName: fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      totalRecords: allRows.length,
    };
  }
}
