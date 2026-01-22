import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../entities/category.entity';
import { SupportedLocale } from '@shared';

export interface ImportCategoriesFromExcelParams {
  fileName: string;
  fileData: string;
  overrideExisting?: boolean;
  dryRun?: boolean;
  defaultIsActive?: boolean;
  actorId?: string | null;
}

export interface ImportCategoriesFromExcelResult {
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  duplicates: number;
  translationImported?: number;
  translationUpdated?: number;
  translationSkipped?: number;
  translationDuplicates?: number;
  errors: Array<{ row: number; message: string }>;
  createdCategoryIds: string[];
  updatedCategoryIds: string[];
}

@Injectable()
export class AdminCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async generateExcelTemplate(locale: SupportedLocale = 'en'): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    const localeCopy = locale === 'vi'
      ? {
          templateHeaders: [
            'Mã danh mục',
            'Tên danh mục',
            'Mô tả',
            'Mã danh mục cha',
            'Kích hoạt',
            'Thứ tự',
            'Hình ảnh',
            'Ảnh nền',
            'Bật lớp phủ',
            'Màu phủ',
            'Độ phủ',
            'Hiển thị tiêu đề',
            'Hiển thị sản phẩm',
            'Hiển thị danh mục con',
            'Hiển thị CTA',
            'Nhãn CTA',
            'Liên kết CTA',
          ],
          templateSample: {
            'Mã danh mục': '',
            'Tên danh mục': 'Danh mục mẫu',
            'Mô tả': 'Mô tả ngắn cho danh mục',
            'Mã danh mục cha': '',
            'Kích hoạt': 'true',
            'Thứ tự': 0,
            'Hình ảnh': 'https://example.com/category.jpg',
            'Ảnh nền': '',
            'Bật lớp phủ': 'true',
            'Màu phủ': '#0f172a',
            'Độ phủ': 70,
            'Hiển thị tiêu đề': 'true',
            'Hiển thị sản phẩm': 'true',
            'Hiển thị danh mục con': 'true',
            'Hiển thị CTA': 'true',
            'Nhãn CTA': '',
            'Liên kết CTA': '',
          },
          translationsHeaders: [
            'Mã danh mục',
            'Ngôn ngữ',
            'Tên danh mục',
            'Mô tả',
            'Đường dẫn',
            'Tiêu đề SEO',
            'Mô tả SEO',
            'Từ khóa SEO',
          ],
          translationsSample: {
            'Mã danh mục': '',
            'Ngôn ngữ': 'vi',
            'Tên danh mục': 'Danh mục mẫu',
            'Mô tả': 'Mô tả theo ngôn ngữ',
            'Đường dẫn': 'danh-muc-mau',
            'Tiêu đề SEO': '',
            'Mô tả SEO': '',
            'Từ khóa SEO': '',
          },
          instructions: [
            ['Hướng dẫn nhập danh mục'],
            [''],
            ['1. THÔNG TIN CƠ BẢN'],
            ['- Mã danh mục: Không bắt buộc. UUID để cập nhật danh mục hiện có'],
            ['- Tên danh mục: Bắt buộc. Tên hiển thị của danh mục'],
            ['- Mô tả: Không bắt buộc. Mô tả danh mục'],
            ['- Mã danh mục cha: Không bắt buộc. UUID của danh mục cha'],
            ['- Kích hoạt: true/false (mặc định: true)'],
            ['- Thứ tự: Không bắt buộc. Thứ tự hiển thị (mặc định: 0)'],
            [''],
            ['2. HÌNH ẢNH'],
            ['- Hình ảnh: Không bắt buộc. URL hình danh mục'],
            ['- Ảnh nền: Không bắt buộc. URL ảnh nền'],
            [''],
            ['3. CÀI ĐẶT HERO'],
            ['- Bật lớp phủ: true/false (mặc định: true)'],
            ['- Màu phủ: Mã màu hex (ví dụ: #0f172a)'],
            ['- Độ phủ: 0-100 (mặc định: 70)'],
            [''],
            ['4. CỜ HIỂN THỊ'],
            ['- Hiển thị tiêu đề: true/false (mặc định: true)'],
            ['- Hiển thị sản phẩm: true/false (mặc định: true)'],
            ['- Hiển thị danh mục con: true/false (mặc định: true)'],
            ['- Hiển thị CTA: true/false (mặc định: true)'],
            [''],
            ['5. CTA'],
            ['- Nhãn CTA: Không bắt buộc. Nhãn nút'],
            ['- Liên kết CTA: Không bắt buộc. URL nút'],
            [''],
            ['6. SHEET BẢN DỊCH'],
            ['- Tên sheet: "Translations"'],
            ['- Mã danh mục: Bắt buộc. UUID danh mục cần dịch'],
            ['- Ngôn ngữ: Bắt buộc. Mã locale (ví dụ: en, vi)'],
            ['- Tên/Mô tả/Đường dẫn/SEO: Không bắt buộc theo từng locale'],
            ['- Nếu đã có bản dịch và không bật ghi đè, hệ thống sẽ bỏ qua'],
            [''],
            ['6. LƯU Ý QUAN TRỌNG'],
            ['- Trường bắt buộc: Tên danh mục'],
            ['- Nên chạy thử (dry-run) để kiểm tra dữ liệu'],
            ['- Để trống Mã danh mục nếu muốn tạo mới'],
          ],
        }
      : {
          templateHeaders: [
            'Category ID',
            'Name',
            'Description',
            'Parent ID',
            'Is Active',
            'Sort Order',
            'Image',
            'Hero Background Image',
            'Hero Overlay Enabled',
            'Hero Overlay Color',
            'Hero Overlay Opacity',
            'Show Title',
            'Show Product Count',
            'Show Subcategory Count',
            'Show CTA',
            'CTA Label',
            'CTA URL',
          ],
          templateSample: {
            'Category ID': '',
            'Name': 'Sample Category',
            'Description': 'Short category description',
            'Parent ID': '',
            'Is Active': 'true',
            'Sort Order': 0,
            'Image': 'https://example.com/category.jpg',
            'Hero Background Image': '',
            'Hero Overlay Enabled': 'true',
            'Hero Overlay Color': '#0f172a',
            'Hero Overlay Opacity': 70,
            'Show Title': 'true',
            'Show Product Count': 'true',
            'Show Subcategory Count': 'true',
            'Show CTA': 'true',
            'CTA Label': '',
            'CTA URL': '',
          },
          translationsHeaders: [
            'Category ID',
            'Locale',
            'Name',
            'Description',
            'Slug',
            'SEO Title',
            'SEO Description',
            'Meta Keywords',
          ],
          translationsSample: {
            'Category ID': '',
            'Locale': 'en',
            'Name': 'Sample Category',
            'Description': 'Localized description',
            'Slug': 'sample-category',
            'SEO Title': '',
            'SEO Description': '',
            'Meta Keywords': '',
          },
          instructions: [
            ['Category Import Template Instructions'],
            [''],
            ['1. BASIC INFORMATION'],
            ['- Category ID: Optional. UUID for updating existing category'],
            ['- Name: Required. Category display name'],
            ['- Description: Optional. Category description'],
            ['- Parent ID: Optional. UUID of parent category'],
            ['- Is Active: true/false (default: true)'],
            ['- Sort Order: Optional. Display order (default: 0)'],
            [''],
            ['2. MEDIA'],
            ['- Image: Optional. Category image URL'],
            ['- Hero Background Image: Optional. Hero image URL'],
            [''],
            ['3. HERO SETTINGS'],
            ['- Hero Overlay Enabled: true/false (default: true)'],
            ['- Hero Overlay Color: Hex color (e.g. #0f172a)'],
            ['- Hero Overlay Opacity: 0-100 (default: 70)'],
            [''],
            ['4. DISPLAY FLAGS'],
            ['- Show Title: true/false (default: true)'],
            ['- Show Product Count: true/false (default: true)'],
            ['- Show Subcategory Count: true/false (default: true)'],
            ['- Show CTA: true/false (default: true)'],
            [''],
            ['5. CTA'],
            ['- CTA Label: Optional. Button label'],
            ['- CTA URL: Optional. Button link'],
            [''],
            ['6. TRANSLATIONS SHEET'],
            ['- Sheet name: "Translations"'],
            ['- Category ID: Required. UUID of the category to translate'],
            ['- Locale: Required. Locale code (e.g. en, vi)'],
            ['- Name/Description/Slug/SEO fields: Optional per locale'],
            ['- If translation exists and override is off, the row will be skipped'],
            [''],
            ['6. IMPORTANT NOTES'],
            ['- Required field: Name'],
            ['- Use dry-run first to validate data'],
            ['- Leave Category ID empty to create new categories'],
          ],
        };

    const templateData = [localeCopy.templateSample];

    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

    const instructionsSheet = XLSX.utils.aoa_to_sheet(localeCopy.instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    const translationsSheet = XLSX.utils.json_to_sheet([localeCopy.translationsSample]);
    XLSX.utils.book_append_sheet(workbook, translationsSheet, 'Translations');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importCategoriesFromExcel(
    params: ImportCategoriesFromExcelParams
  ): Promise<ImportCategoriesFromExcelResult> {
    const {
      fileData,
      fileName,
      overrideExisting = false,
      dryRun = false,
      defaultIsActive = true,
    } = params;

    if (!fileData || fileData.trim().length === 0) {
      throw new Error('File data is required for import');
    }

    const summary: ImportCategoriesFromExcelResult = {
      totalRows: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      duplicates: 0,
      translationImported: 0,
      translationUpdated: 0,
      translationSkipped: 0,
      translationDuplicates: 0,
      errors: [],
      createdCategoryIds: [],
      updatedCategoryIds: [],
    };

    const sanitizeBase64 = (input: string): string => {
      const trimmed = input.trim();
      const commaIndex = trimmed.indexOf(',');
      if (commaIndex !== -1) {
        return trimmed.slice(commaIndex + 1);
      }
      return trimmed;
    };

    const toBuffer = (input: string): Buffer => {
      try {
        return Buffer.from(sanitizeBase64(input), 'base64');
      } catch (error) {
        throw new Error('Invalid file content. Expected base64 encoded data.');
      }
    };

    const buffer = toBuffer(fileData);

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch (error) {
      throw new Error(
        `Unable to read Excel file${fileName ? ` ${fileName}` : ''}. Please ensure the file is a valid .xlsx or .xls document.`
      );
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('The uploaded workbook does not contain any sheets.');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) {
      throw new Error('The first sheet of the workbook is empty or unreadable.');
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
      raw: false,
      blankrows: false,
    });

    if (!rawRows.length) {
      throw new Error('No data rows found in the uploaded file.');
    }

    summary.totalRows = rawRows.length;

    const normalizeString = (value: any): string => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    const removeDiacritics = (value: string): string =>
      value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const normalizeKey = (key: string): string => {
      if (!key) {
        return '';
      }
      const normalized = removeDiacritics(normalizeString(key));
      return normalized.toLowerCase().replace(/[^a-z0-9]+/g, '');
    };

    const normalizedRows = rawRows.map((row) => {
      const normalizedEntry: Record<string, any> = {};
      Object.entries(row).forEach(([header, value]) => {
        const normalizedKey = normalizeKey(header);
        if (normalizedKey) {
          normalizedEntry[normalizedKey] = value;
        }
      });
      return normalizedEntry;
    });

    const columnMap: Record<string, string[]> = {
      id: ['id', 'categoryid', 'category_id', 'madanhmuc', 'iddanhmuc'],
      name: ['name', 'categoryname', 'tendanhmuc', 'danhmuc'],
      description: ['description', 'mota', 'motadanhmuc'],
      parentId: ['parentid', 'parent_id', 'parent', 'madanhmuccha', 'danhmuccha'],
      isActive: ['isactive', 'kichhoat', 'active', 'hoatdong'],
      sortOrder: ['sortorder', 'sapxep', 'thutu'],
      image: ['image', 'imageurl', 'anh', 'hinhanh', 'hinhanhurl'],
      heroBackgroundImage: ['herobackgroundimage', 'herobg', 'herobackground', 'anhnen'],
      heroOverlayEnabled: ['herooverlayenabled', 'herooverlay'],
      heroOverlayColor: ['herooverlaycolor', 'mauphu', 'mauoverlay'],
      heroOverlayOpacity: ['herooverlayopacity', 'dophu', 'opacity'],
      showTitle: ['showtitle', 'hienthitieude'],
      showProductCount: ['showproductcount', 'hienthisanpham'],
      showSubcategoryCount: ['showsubcategorycount', 'hienthidanhmuccon'],
      showCta: ['showcta', 'hienthicta'],
      ctaLabel: ['ctalabel', 'nhancta'],
      ctaUrl: ['ctaurl', 'linkcta', 'urlcta'],
    };

    const getFromRow = (row: Record<string, any>, keys: string[]): any => {
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key];
          if (value !== undefined && value !== null && normalizeString(value) !== '') {
            return value;
          }
        }
      }
      return undefined;
    };

    const parseBoolean = (value: any, fallback: boolean): boolean => {
      if (value === undefined || value === null || normalizeString(value) === '') {
        return fallback;
      }

      const normalized = normalizeKey(String(value));
      if (['1', 'true', 'yes', 'co', 'dang', 'kichhoat', 'active'].includes(normalized)) {
        return true;
      }
      if (['0', 'false', 'no', 'khong', 'ngung', 'inactive', 'tamdung'].includes(normalized)) {
        return false;
      }
      return fallback;
    };

    const parseNumber = (value: any, fallback = 0): number => {
      if (value === undefined || value === null || normalizeString(value) === '') {
        return fallback;
      }

      const raw = String(value).trim();
      const noSpaces = raw.replace(/\s+/g, '');
      const hasComma = noSpaces.includes(',');
      const hasDot = noSpaces.includes('.');

      let normalizedNumeric = noSpaces;
      if (hasComma && hasDot) {
        normalizedNumeric = normalizedNumeric.replace(/,/g, '');
      } else if (hasComma && !hasDot) {
        normalizedNumeric = normalizedNumeric.replace(/,/g, '.');
      }

      const num = Number(normalizedNumeric);
      return Number.isFinite(num) ? num : fallback;
    };

    const optionalString = (value: any): string | undefined => {
      const normalized = normalizeString(value);
      return normalized.length > 0 ? normalized : undefined;
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const setIfDefined = <T extends Record<string, any>, K extends keyof T>(
      target: T,
      key: K,
      value: T[K] | undefined
    ) => {
      if (value !== undefined) {
        target[key] = value;
      }
    };

    for (let index = 0; index < normalizedRows.length; index += 1) {
      const row = normalizedRows[index];
      const rowNumber = index + 2;

      try {
        const nameValue = getFromRow(row, columnMap.name);
        const name = normalizeString(nameValue);
        if (!name) {
          summary.skipped += 1;
          summary.errors.push({ row: rowNumber, message: 'Missing required field: Name' });
          continue;
        }

        const idValue = getFromRow(row, columnMap.id);
        const categoryId = optionalString(idValue);
        if (categoryId && !uuidRegex.test(categoryId)) {
          summary.skipped += 1;
          summary.errors.push({ row: rowNumber, message: `Invalid Category ID: ${categoryId}` });
          continue;
        }

        const parentIdValue = getFromRow(row, columnMap.parentId);
        const parentId = optionalString(parentIdValue);
        if (parentId && !uuidRegex.test(parentId)) {
          summary.skipped += 1;
          summary.errors.push({ row: rowNumber, message: `Invalid Parent ID: ${parentId}` });
          continue;
        }

        if (parentId) {
          const parentExists = await this.categoryRepository.findById(parentId);
          if (!parentExists) {
            summary.skipped += 1;
            summary.errors.push({ row: rowNumber, message: `Parent category not found: ${parentId}` });
            continue;
          }
        }

        const payload: Partial<Category> = {
          name,
        };

        setIfDefined(payload, 'description', optionalString(getFromRow(row, columnMap.description)));
        setIfDefined(payload, 'parentId', parentId);
        setIfDefined(payload, 'image', optionalString(getFromRow(row, columnMap.image)));
        setIfDefined(payload, 'heroBackgroundImage', optionalString(getFromRow(row, columnMap.heroBackgroundImage)));
        setIfDefined(payload, 'heroOverlayColor', optionalString(getFromRow(row, columnMap.heroOverlayColor)));
        setIfDefined(payload, 'ctaLabel', optionalString(getFromRow(row, columnMap.ctaLabel)));
        setIfDefined(payload, 'ctaUrl', optionalString(getFromRow(row, columnMap.ctaUrl)));

        const rawIsActive = getFromRow(row, columnMap.isActive);
        if (rawIsActive !== undefined) {
          payload.isActive = parseBoolean(rawIsActive, defaultIsActive);
        }

        const rawSortOrder = getFromRow(row, columnMap.sortOrder);
        if (rawSortOrder !== undefined) {
          payload.sortOrder = parseNumber(rawSortOrder, 0);
        }

        const rawHeroOverlayEnabled = getFromRow(row, columnMap.heroOverlayEnabled);
        if (rawHeroOverlayEnabled !== undefined) {
          payload.heroOverlayEnabled = parseBoolean(rawHeroOverlayEnabled, true);
        }

        const rawHeroOverlayOpacity = getFromRow(row, columnMap.heroOverlayOpacity);
        if (rawHeroOverlayOpacity !== undefined) {
          const opacity = parseNumber(rawHeroOverlayOpacity, 70);
          payload.heroOverlayOpacity = Math.min(100, Math.max(0, opacity));
        }

        const rawShowTitle = getFromRow(row, columnMap.showTitle);
        if (rawShowTitle !== undefined) {
          payload.showTitle = parseBoolean(rawShowTitle, true);
        }

        const rawShowProductCount = getFromRow(row, columnMap.showProductCount);
        if (rawShowProductCount !== undefined) {
          payload.showProductCount = parseBoolean(rawShowProductCount, true);
        }

        const rawShowSubcategoryCount = getFromRow(row, columnMap.showSubcategoryCount);
        if (rawShowSubcategoryCount !== undefined) {
          payload.showSubcategoryCount = parseBoolean(rawShowSubcategoryCount, true);
        }

        const rawShowCta = getFromRow(row, columnMap.showCta);
        if (rawShowCta !== undefined) {
          payload.showCta = parseBoolean(rawShowCta, true);
        }

        let existingCategory: Category | null = null;
        if (categoryId) {
          existingCategory = await this.categoryRepository.findById(categoryId);
          if (!existingCategory) {
            summary.skipped += 1;
            summary.errors.push({ row: rowNumber, message: `Category not found: ${categoryId}` });
            continue;
          }
        } else {
          const matches = await this.categoryRepository.findByNameAndParent(name, parentId ?? null);
          if (matches.length > 1) {
            summary.skipped += 1;
            summary.errors.push({
              row: rowNumber,
              message: `Multiple categories found with name "${name}". Provide Category ID to update.`,
            });
            continue;
          }
          if (matches.length === 1) {
            existingCategory = matches[0];
          }
        }

        if (existingCategory) {
          if (!overrideExisting) {
            summary.duplicates += 1;
            summary.skipped += 1;
            summary.errors.push({
              row: rowNumber,
              message: `Category "${name}" already exists. Enable override to update existing records.`,
            });
            continue;
          }

          if (dryRun) {
            summary.updated += 1;
            summary.updatedCategoryIds.push(existingCategory.id);
            continue;
          }

          const updated = await this.categoryRepository.update(existingCategory.id, payload);
          if (!updated) {
            summary.skipped += 1;
            summary.errors.push({ row: rowNumber, message: `Failed to update category: ${existingCategory.id}` });
            continue;
          }

          summary.updated += 1;
          summary.updatedCategoryIds.push(updated.id);
        } else {
          if (dryRun) {
            summary.imported += 1;
            continue;
          }

          if (payload.isActive === undefined) {
            payload.isActive = defaultIsActive;
          }

          const created = await this.categoryRepository.create(payload);
          summary.imported += 1;
          summary.createdCategoryIds.push(created.id);
        }
      } catch (error: any) {
        summary.skipped += 1;
        summary.errors.push({
          row: rowNumber,
          message: error?.message || 'Failed to process row',
        });
      }
    }

    const translationSheetName = workbook.SheetNames.find(
      (name) => name.trim().toLowerCase() === 'translations'
    );

    if (translationSheetName) {
      const translationsSheet = workbook.Sheets[translationSheetName];
      if (translationsSheet) {
        const rawTranslationRows = XLSX.utils.sheet_to_json<Record<string, any>>(translationsSheet, {
          defval: '',
          raw: false,
          blankrows: false,
        });

        const translationColumnMap: Record<string, string[]> = {
          categoryId: ['categoryid', 'category_id', 'madanhmuc', 'iddanhmuc'],
          locale: ['locale', 'ngonngu', 'lang'],
          name: ['name', 'tendanhmuc', 'danhmuc'],
          description: ['description', 'mota'],
          slug: ['slug', 'duongdan'],
          seoTitle: ['seotitle', 'tieudeseo'],
          seoDescription: ['seodescription', 'motaseo'],
          metaKeywords: ['metakeywords', 'tukhoaseo', 'tukhoa'],
        };

        const normalizedTranslationRows = rawTranslationRows.map((row) => {
          const normalizedEntry: Record<string, any> = {};
          Object.entries(row).forEach(([header, value]) => {
            const normalizedKey = normalizeKey(header);
            if (normalizedKey) {
              normalizedEntry[normalizedKey] = value;
            }
          });
          return normalizedEntry;
        });

        const parseLocale = (value: any): string | null => {
          const locale = normalizeString(value).toLowerCase();
          if (!locale) return null;
          if (locale.length < 2 || locale.length > 5) return null;
          return locale;
        };

        for (let index = 0; index < normalizedTranslationRows.length; index += 1) {
          const row = normalizedTranslationRows[index];
          const rowNumber = index + 2;

          try {
            const categoryIdValue = getFromRow(row, translationColumnMap.categoryId);
            const categoryId = optionalString(categoryIdValue);
            if (!categoryId || !uuidRegex.test(categoryId)) {
              summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
              summary.errors.push({
                row: rowNumber,
                message: `Translations sheet: invalid Category ID at row ${rowNumber}`,
              });
              continue;
            }

            const localeValue = getFromRow(row, translationColumnMap.locale);
            const locale = parseLocale(localeValue);
            if (!locale) {
              summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
              summary.errors.push({
                row: rowNumber,
                message: `Translations sheet: invalid Locale at row ${rowNumber}`,
              });
              continue;
            }

            const categoryExists = await this.categoryRepository.findById(categoryId);
            if (!categoryExists) {
              summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
              summary.errors.push({
                row: rowNumber,
                message: `Translations sheet: category not found for ID ${categoryId}`,
              });
              continue;
            }

            const translationPayload = {
              name: optionalString(getFromRow(row, translationColumnMap.name)),
              description: optionalString(getFromRow(row, translationColumnMap.description)),
              slug: optionalString(getFromRow(row, translationColumnMap.slug)),
              seoTitle: optionalString(getFromRow(row, translationColumnMap.seoTitle)),
              seoDescription: optionalString(getFromRow(row, translationColumnMap.seoDescription)),
              metaKeywords: optionalString(getFromRow(row, translationColumnMap.metaKeywords)),
            };

            const hasTranslationValues = Object.values(translationPayload).some(
              (value) => value !== undefined
            );
            if (!hasTranslationValues) {
              summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
              summary.errors.push({
                row: rowNumber,
                message: `Translations sheet: no translatable fields provided at row ${rowNumber}`,
              });
              continue;
            }

            const existingTranslation = await this.categoryRepository.findCategoryTranslation(
              categoryId,
              locale
            );

            if (existingTranslation) {
              if (!overrideExisting) {
                summary.translationDuplicates = (summary.translationDuplicates ?? 0) + 1;
                summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
                summary.errors.push({
                  row: rowNumber,
                  message: `Translations sheet: translation already exists for ${categoryId} (${locale}). Enable override to update.`,
                });
                continue;
              }

              if (dryRun) {
                summary.translationUpdated = (summary.translationUpdated ?? 0) + 1;
                continue;
              }

              await this.categoryRepository.updateCategoryTranslation(categoryId, locale, translationPayload);
              summary.translationUpdated = (summary.translationUpdated ?? 0) + 1;
            } else {
              if (dryRun) {
                summary.translationImported = (summary.translationImported ?? 0) + 1;
                continue;
              }

              await this.categoryRepository.createCategoryTranslation({
                category_id: categoryId,
                locale,
                ...translationPayload,
              });
              summary.translationImported = (summary.translationImported ?? 0) + 1;
            }
          } catch (error: any) {
            summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
            summary.errors.push({
              row: rowNumber,
              message: `Translations sheet: ${error?.message || 'Failed to process row'}`,
            });
          }
        }
      }
    }

    return summary;
  }
}
