import { Injectable } from '@nestjs/common';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ApiStatusCodes } from '@shared';
import { BrandRepository } from '../repositories/brand.repository';
import { DataExportService } from '../../export/services/data-export.service';
import { ExportJobRunnerService } from '../../export/services/export-job-runner.service';
import { ExportJobPayload } from '../../export/interfaces/export-payload.interface';
import { ExportFormat } from '../../export/entities/data-export-job.entity';
import { BRAND_EXPORT_COLUMNS, BRAND_TEMPLATE_EXPORT_COLUMNS } from '../export/brand-export.columns';
import { ImportJobService } from '../../import/services/import-job.service';
import * as XLSX from 'xlsx';

@Injectable()
export class AdminBrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly responseHandler: ResponseService,
    private readonly dataExportService: DataExportService,
    private readonly exportJobRunnerService: ExportJobRunnerService,
    private readonly importJobService: ImportJobService,
  ) {}

  async exportBrands(
    format: string,
    filters?: string | Record<string, any>,
    requestedBy?: string,
    exportMode: 'standard' | 'template' = 'standard',
  ) {
    const parsedFilters = this.parseFilters(filters);
    const sanitizedFilters = this.sanitizeExportFilters(parsedFilters);
    const resolvedFormat: ExportFormat = format === 'json' ? 'json' : 'csv';

    const resource = exportMode === 'template' ? 'brand_import_template' : 'brands';

    const job = await this.dataExportService.requestExportJob({
      resource,
      format: resolvedFormat,
      filters: sanitizedFilters,
      columns: exportMode === 'template' ? BRAND_TEMPLATE_EXPORT_COLUMNS : BRAND_EXPORT_COLUMNS,
      options: {
        pageSize: 500,
        fileName: exportMode === 'template' ? `brand-import-template-${new Date().toISOString().split('T')[0]}` : undefined,
      },
      requestedBy,
    });

    const payload: ExportJobPayload = {
      jobId: job.id,
      resource: job.resource,
      format: job.format,
      filters: job.filters || undefined,
      columns: job.columns || undefined,
      options: job.options || undefined,
      requestedBy: job.requestedBy || undefined,
    };

    const result = await this.exportJobRunnerService.run(payload);
    if (result === 'processed') {
      return (await this.dataExportService.getJob(job.id)) ?? job;
    }
    return job;
  }

  async listBrandExportJobs(limit = 10, requestedBy?: string, page = 1) {
    return this.dataExportService.listJobs(['brands', 'brand_import_template'], {
      limit,
      page,
      requestedBy,
    });
  }

  async estimateBrandExport(filters?: string | Record<string, any>) {
    const parsedFilters = this.parseFilters(filters);
    const sanitizedFilters = this.sanitizeExportFilters(parsedFilters);
    const result = await this.brandRepository.findMany({
      page: 1,
      limit: 1,
      search: sanitizedFilters?.search,
      isActive: sanitizedFilters?.isActive,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    return { total: result.total };
  }

  async generateExcelTemplate(locale: string = 'en'): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const isVi = locale === 'vi';

    const templateHeaders = isVi
      ? [
          'Mã Thương Hiệu (UUID)',
          'Tên',
          'Mô tả',
          'Website',
          'Logo',
          'Kích hoạt',
          'Thứ tự',
        ]
      : [
          'Brand ID (UUID)',
          'Name',
          'Description',
          'Website',
          'Logo',
          'Is Active',
          'Sort Order',
        ];

    const templateSample = isVi
      ? {
          'Mã Thương Hiệu (UUID)': '',
          'Tên': 'Example Brand',
          'Mô tả': 'Mô tả thương hiệu',
          'Website': 'https://example.com',
          'Logo': 'https://example.com/logo.png',
          'Kích hoạt': 'true',
          'Thứ tự': 0,
        }
      : {
          'Brand ID (UUID)': '',
          'Name': 'Example Brand',
          'Description': 'Brand description',
          'Website': 'https://example.com',
          'Logo': 'https://example.com/logo.png',
          'Is Active': 'true',
          'Sort Order': 0,
        };

    const templateSheet = XLSX.utils.json_to_sheet([templateSample], { header: templateHeaders });
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

    const instructionsData = isVi
      ? [
          ['Hướng dẫn nhập Brand'],
          [''],
          ['1. THÔNG TIN CƠ BẢN'],
          ['- Mã Thương Hiệu: UUID của brand (nếu có sẽ update, nếu không sẽ tạo mới)'],
          ['- Tên: Tên thương hiệu'],
          ['- Kích hoạt: true/false'],
          ['- Thứ tự: số thứ tự (0, 1, 2...)'],
          [''],
          ['2. SHEET BẢN DỊCH (Translations)'],
          ['- Mã Thương Hiệu (UUID): dùng để map dịch chính xác'],
          ['- Ngôn ngữ: vi, en, v.v.'],
        ]
      : [
          ['Brand Import Instructions'],
          [''],
          ['1. BASIC INFO'],
          ['- Brand ID: UUID of brand (updates if found, creates new if missing)'],
          ['- Name: Brand name'],
          ['- Is Active: true/false'],
          ['- Sort Order: number (0, 1, 2...)'],
          [''],
          ['2. TRANSLATIONS SHEET'],
          ['- Brand ID (UUID): Recommended for accurate mapping'],
          ['- Locale: en, vi, etc.'],
        ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    const translationHeaders = isVi
      ? ['Mã Thương Hiệu (UUID)', 'Ngôn ngữ', 'Tên', 'Mô tả']
      : ['Brand ID (UUID)', 'Locale', 'Name', 'Description'];

    const translationSample = isVi
      ? {
          'Mã Thương Hiệu (UUID)': '',
          'Ngôn ngữ': 'vi',
          'Tên': 'Thương hiệu ví dụ',
          'Mô tả': 'Mô tả thương hiệu',
        }
      : {
          'Brand ID (UUID)': '',
          'Locale': 'en',
          'Name': 'Example Brand',
          'Description': 'Brand description',
        };

    const translationsSheet = XLSX.utils.json_to_sheet([translationSample], { header: translationHeaders });
    XLSX.utils.book_append_sheet(workbook, translationsSheet, 'Translations');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importBrandsFromExcel(params: {
    fileName: string;
    fileData: string;
    overrideExisting?: boolean;
    dryRun?: boolean;
    actorId?: string | null;
  }): Promise<{ jobId: string }> {
    const {
      fileData,
      fileName,
      overrideExisting = false,
      dryRun = false,
      actorId,
    } = params;

    if (!fileData || fileData.trim().length === 0) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'File data is required for import',
        'BAD_REQUEST',
      );
    }

    const job = await this.importJobService.createJob('brands', fileName, actorId ?? undefined);

    (async () => {
      try {
        const summary = {
          totalRows: 0,
          imported: 0,
          skipped: 0,
          duplicates: 0,
          updated: 0,
          errors: [] as Array<{ row: number; message: string }>,
          details: [] as Array<{
            row: number;
            name: string;
            status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'ERROR';
            message?: string;
          }>,
        };

        const sanitizeBase64 = (input: string): string => {
          const trimmed = input.trim();
          const commaIndex = trimmed.indexOf(',');
          if (commaIndex !== -1) {
            return trimmed.slice(commaIndex + 1);
          }
          return trimmed;
        };

        const buffer = Buffer.from(sanitizeBase64(fileData), 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('The uploaded workbook does not contain any sheets.');
        }

        const worksheet = workbook.Sheets['Template'] || workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: '',
          raw: false,
          blankrows: false,
        });

        const translationSheet = workbook.Sheets['Translations'];
        const translationRows = translationSheet
          ? XLSX.utils.sheet_to_json<Record<string, any>>(translationSheet, {
              defval: '',
              raw: false,
              blankrows: false,
            })
          : [];

        summary.totalRows = rawRows.length;

        const normalizeTranslationKey = (input: string | null | undefined): string => {
          if (!input) return '';
          return String(input).trim().toLowerCase();
        };

        const translationByBrandId = new Map<string, Record<string, any>[]>();

        translationRows.forEach((t) => {
          const brandId = t['Mã Thương Hiệu (UUID)'] || t['Brand ID (UUID)'];
          const locale = t['Ngôn ngữ'] || t['Locale'];
          if (!brandId || !locale) {
            return;
          }
          const key = normalizeTranslationKey(String(brandId));
          const entries = translationByBrandId.get(key) || [];
          entries.push(t);
          translationByBrandId.set(key, entries);
        });

        let processedRows = 0;

        const updateProgress = async () => {
          const progress = rawRows.length
            ? Math.round((processedRows / rawRows.length) * 100)
            : 100;
          const processedItems = summary.imported + summary.updated + summary.skipped;
          const failedItems = summary.errors.length;
          await this.importJobService.updateProgress(job.id, progress, processedItems, failedItems, summary.totalRows);
        };

        for (let index = 0; index < rawRows.length; index += 1) {
          const row = rawRows[index];
          const rowNumber = index + 2;

          try {
            const idRaw = row['Mã Thương Hiệu (UUID)'] || row['Brand ID (UUID)'];
            const name = String(row['Tên'] || row['Name'] || '').trim();
            const description = String(row['Mô tả'] || row['Description'] || '').trim();
            const website = String(row['Website'] || '').trim();
            const logo = String(row['Logo'] || '').trim();
            const isActiveValue = row['Kích hoạt'] ?? row['Is Active'];
            const sortOrderValue = row['Thứ tự'] ?? row['Sort Order'];

            if (!name) {
              summary.skipped += 1;
              summary.details.push({
                row: rowNumber,
                name: name || 'Unknown',
                status: 'SKIPPED',
                message: 'Missing brand name.',
              });
              processedRows += 1;
              await updateProgress();
              continue;
            }

            const isActive =
              isActiveValue === '' || isActiveValue === undefined || isActiveValue === null
                ? undefined
                : typeof isActiveValue === 'boolean'
                  ? isActiveValue
                  : String(isActiveValue).toLowerCase() === 'true';

            const sortOrder = Number.isFinite(Number(sortOrderValue)) ? Number(sortOrderValue) : undefined;

            const brandPayload: any = {
              name,
              description: description || undefined,
              website: website || undefined,
              logo: logo || undefined,
              ...(isActive === undefined ? {} : { isActive }),
              ...(sortOrder === undefined ? {} : { sortOrder }),
            };

            const id = idRaw ? String(idRaw).trim() : '';
            const existingById = id ? await this.brandRepository.findById(id, []) : null;
            const existingByName = !id ? await this.brandRepository.findByName(name) : null;
            const existing = existingById || existingByName;

            if (dryRun) {
              summary.imported += 1;
              summary.details.push({
                row: rowNumber,
                name,
                status: 'IMPORTED',
                message: 'Dry-run: Validated successfully',
              });
              processedRows += 1;
              await updateProgress();
              continue;
            }

            if (existing) {
              if (!overrideExisting && existingByName && !existingById) {
                summary.skipped += 1;
                summary.details.push({
                  row: rowNumber,
                  name,
                  status: 'SKIPPED',
                  message: 'Brand name already exists. Use override to update.',
                });
              } else {
                await this.brandRepository.update(existing.id, brandPayload);
                summary.updated += 1;
                summary.details.push({
                  row: rowNumber,
                  name,
                  status: 'UPDATED',
                });
              }
            } else {
              const created = await this.brandRepository.create({
                ...(id ? { id } : {}),
                ...brandPayload,
              });
              summary.imported += 1;
              summary.details.push({
                row: rowNumber,
                name,
                status: 'IMPORTED',
              });
              if (id && created?.id && created.id !== id) {
                // If backend ignored provided id, we still proceed.
              }
            }

            if (id && translationByBrandId.has(normalizeTranslationKey(id))) {
              const translationEntries = translationByBrandId.get(normalizeTranslationKey(id)) || [];
              const locales = translationEntries
                .map(entry => String(entry['Ngôn ngữ'] || entry['Locale'] || '').trim())
                .filter(Boolean);

              if (locales.length) {
                const brandId = existing?.id || id;
                await this.upsertBrandTranslations(brandId, translationEntries);
              }
            }

            processedRows += 1;
            await updateProgress();
          } catch (rowError: any) {
            summary.errors.push({
              row: rowNumber,
              message: rowError?.message || 'Failed to import brand.',
            });
            summary.details.push({
              row: rowNumber,
              name: String(row['Tên'] || row['Name'] || 'Unknown'),
              status: 'ERROR',
              message: rowError?.message || 'Failed to import brand.',
            });
            processedRows += 1;
            await updateProgress();
          }
        }

        await this.importJobService.completeJob(job.id, summary);
      } catch (error) {
        await this.importJobService.failJob(job.id, error instanceof Error ? error.message : String(error));
      }
    })();

    return { jobId: job.id };
  }

  private async upsertBrandTranslations(brandId: string, rows: Record<string, any>[]) {
    const entries = rows
      .map((row) => {
        const locale = String(row['Ngôn ngữ'] || row['Locale'] || '').trim();
        if (!locale) {
          return null;
        }
        return {
          locale,
          name: String(row['Tên'] || row['Name'] || '').trim() || null,
          description: String(row['Mô tả'] || row['Description'] || '').trim() || null,
        };
      })
      .filter(Boolean) as Array<{ locale: string; name?: string | null; description?: string | null }>;

    await this.brandRepository.upsertTranslations(brandId, entries);
  }

  private parseFilters(filters?: string | Record<string, any>): Record<string, any> | undefined {
    if (!filters) {
      return undefined;
    }

    if (typeof filters === 'object') {
      return filters;
    }

    try {
      return JSON.parse(filters);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Invalid filters payload',
        'INVALID_FILTERS'
      );
    }
  }

  private sanitizeExportFilters(filters?: Record<string, any>) {
    if (!filters) {
      return undefined;
    }

    const sanitized: Record<string, any> = {};

    if (typeof filters.search === 'string' && filters.search.trim()) {
      sanitized.search = filters.search.trim();
    }

    if (typeof filters.isActive === 'boolean') {
      sanitized.isActive = filters.isActive;
    }

    return sanitized;
  }
}
