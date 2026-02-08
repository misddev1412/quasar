import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseExportHandler, ExportPageResult } from '@backend/modules/export/handlers/base-export.handler';
import { ExportHandlerRegistry } from '@backend/modules/export/services/export-handler.registry';
import { ProductRepository, ProductFilters } from '@backend/modules/products/repositories/product.repository';
import { Product } from '@backend/modules/products/entities/product.entity';
import { PRODUCT_TEMPLATE_EXPORT_COLUMNS } from '@backend/modules/products/export/product-export.columns';
import * as XLSX from 'xlsx';

@Injectable()
export class ProductTemplateExportHandler extends BaseExportHandler<Record<string, any>, any> implements OnModuleInit {
    readonly resource = 'product_import_template';

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
        return PRODUCT_TEMPLATE_EXPORT_COLUMNS;
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
    ): Promise<ExportPageResult<any>> {
        const normalizedFilters = this.normalizeFilters(filters);
        const result = await this.productRepository.findAll({
            page: params.page,
            limit: params.limit,
            filters: normalizedFilters,
            relations: [
                'brand',
                'productCategories',
                'productCategories.category',
                'variants',
                'variants.variantItems',
                'variants.variantItems.attribute',
                'variants.variantItems.attributeValue',
                'media'
            ],
        });

        const flattenedItems: any[] = [];

        for (const product of result.items) {
            const variants = (product.variants || []);
            const mediaUrls = (product.media || [])
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map(m => m.url)
                .join(', ');

            const categoryIds = (product.productCategories || [])
                .map(pc => pc.categoryId)
                .filter(Boolean)
                .join(', ');

            // If no variants, output one row for the product
            if (variants.length === 0) {
                flattenedItems.push({
                    ...product,
                    variantName: '',
                    variantSku: '',
                    variantPrice: '',
                    variantStock: '',
                    variantAttributes: '',
                    images: mediaUrls,
                    categoryIds,
                });
            } else {
                // Output one row per variant
                // The first row will contain product info + first variant info
                // Subsequent rows could theoretically contain only variant info if we wanted to be sparse,
                // but for import templates it's often safer to repeat product info or at least the ID/SKU to link them.
                // However, the import logic usually groups by Product SKU/ID.
                // Let's duplicate product info for each row to be safe and simple.

                for (const variant of variants) {
                    const attributes = (variant.variantItems || [])
                        .map(vi => `${vi.attribute?.name}:${vi.attributeValue?.value}`)
                        .join('|');

                    flattenedItems.push({
                        ...product,
                        images: mediaUrls,
                        categoryIds,
                        // Variant specific fields override or complement
                        variantName: variant.name,
                        variantSku: variant.sku,
                        variantPrice: variant.price,
                        variantStock: variant.stockQuantity,
                        variantAttributes: attributes,
                    });
                }
            }
        }

        // Since we expanded items, the "total" from repository (product count) 
        // doesn't match the number of rows we return. 
        // This might confuse the BaseExportHandler pagination if it strictly relies on "total".
        // But BaseExportHandler uses `result.items.length` vs `pageSize` to determine when to stop?
        // Actually BaseExportHandler implementation:
        // `if (total >= result.total || result.items.length < pageSize)`
        // If we return MORE items than limit, it might be fine, or we might need to handle pagination differently.
        // 
        // The issue: We fetch 'limit' PRODUCTS, but might return 'limit * N' ROWS.
        // The BaseExportHandler loop increments `page` and accumulates `total`.
        // If we just return the flattened items, `result.items.length` will be large.
        // `total` in BaseExportHandler sums up these lengths.
        // `result.total` from repo is PRODUCT total.
        // If we return just the flatten items, `total` (rows) will quickly exceed `result.total` (products).
        // So we should probably report `total` as an estimated row count or just ensure the loop terminates correctly.
        //
        // The safest way here is to let the base handler think we are paginating PRODUCTS, 
        // but the `fetchPage` returns the expanded ROWS. 
        // EXCEPT `BaseExportHandler` types `ExportPageResult<TRecord>`.
        // If we want to be correct, `fetchPage` should return `items` as the rows.
        // 
        // If `total` is used for progress bar, it might be off.
        // Let's try to pass a higher total if possible, or just accept the discrepancy.
        // Ideally we'd Count variants + products without variants, but that's expensive.

        // For now, let's just return the flattened items. 
        // The base handler loop checks `result.items.length < pageSize`.
        // Since we fetch `limit` products, if `limit` is 500, we might get 500 products.
        // If each has variants, we return > 500 rows.
        // `result.items.length` (rows) >= `limit` (page size).
        // So the loop continues.
        // Eventually `result.items.length` will be 0 or < pageSize (last page of products).
        // So termination condition `result.items.length < pageSize` works IF the last page is small.
        // BUT what if the last page has 1 product with 100 variants? 100 < 500, so it stops. Correct.
        // What if we have exact multiple?
        // The key is `this.productRepository.findAll` controls the pagination loop.
        // As long as we iterate through all products pages, we get all data.
        //
        // One edge case: `total >= result.total`.
        // `total` tracks processed items (rows). `result.total` is products.
        // `rows` >= `products`.
        // So `total >= result.total` will likely trigger EARLY.
        // We must ensure `result.total` reflects the ROWS or is ignored.
        // BaseExportHandler:
        // `if (total >= result.total || result.items.length < pageSize)`
        // We need to fake `result.total` to be very large or `Infinity` to prevent early exit,
        // OR we just set it to `total + (something)` if not finished?
        //
        // Actually, `items` in `ExportPageResult` are the exported records.
        // We can't easily calculate total rows without a separate count query.
        // Let's multiply `result.total` by a factor (e.g. 10) as a heuristic to avoid early exit?
        // Or better: filter `check` in BaseExportHandler.
        // 
        // Let's just override `result.total` to be `result.total * 5` (assuming avg 5 variants) 
        // OR just use `Number.MAX_SAFE_INTEGER` if we don't know?
        // If we set it to MAX, the progress bar might look like 0%...
        // 
        // Let's stick to `fetchedAll` logic in BaseService. 
        // If we modify `BaseExportHandler` it affects everyone.
        // 
        // Implementation Detail: In `fetchPage`, we can return specific `total`.
        // If we return `items.length` + `result.total`? No.
        // 
        // Let's leave `total` as `result.total` for now. 
        // If `total` (rows processed) > `result.total` (products), it terminates.
        // THIS IS A BUG for expansion!
        // Example: Total 10 products.
        // Page 1: 5 products -> 20 variants (rows).
        // `total` = 20. `result.total` = 10.
        // 20 >= 10 -> Stop.
        // We only processed 5 products!
        // 
        // FIX: We must define `fetchPage` to return `total` as null or handle it.
        // But `ExportPageResult` expects `total: number`.
        // 
        // Workaround: 
        // In this handler, query the TOTAL count of variants + products-without-variants?
        // Queries:
        // 1. Count products
        // 2. Count variants
        // Total = (Products - ProductsWithVariants) + Variants?
        // Easier: Just Count products.
        // But we need `total` (rows) to be > `processed` (rows).
        // 
        // Alternative: We can override `BaseExportHandler.generateFile`? No, it's not virtual (although in JS it is).
        // 
        // Best Approach for now without changing Base:
        // Return a very large number for `total` in `fetchPage` so the loop depends only on `items.length < pageSize`.
        // But `items.length` (rows) could be > `pageSize` (products limit) even on the last page!
        // e.g. Last page has 1 product with 1000 variants. Pagination limit 500.
        // Returns 1000 rows. 1000 is NOT < 500. Loop continues.
        // Next page (page+1): Repo returns 0 products.
        // Rows = 0. 0 < 500. Loop stops.
        // CORRECT.
        // 
        // So the only blocker is `total >= result.total`.
        // We must return a `total` that is definitely larger than the row count.

        return {
            items: flattenedItems,
            total: result.total * 1000, // Heuristic to prevent early termination based on count
        };
    }

    transformRecord(record: any): Record<string, any> {
        return {
            id: record.id,
            name: record.name,
            sku: record.sku,
            description: record.description,
            shortDescription: record.shortDescription,
            status: record.status,
            price: record.price,
            compareAtPrice: record.compareAtPrice,
            costPrice: record.costPrice,
            stockQuantity: record.stockQuantity,
            trackInventory: record.trackInventory,
            brandId: record.brandId,
            warrantyId: record.warrantyId,
            isFeatured: record.isFeatured,
            isContactPrice: record.isContactPrice,
            isActive: record.isActive,
            images: record.images,
            categoryIds: record.categoryIds,
            // Variant fields
            variantName: record.variantName,
            variantSku: record.variantSku,
            variantPrice: record.variantPrice,
            variantStock: record.variantStock,
            variantAttributes: record.variantAttributes,
        };
    }

    async generateCustomFile(
        payload: { filters?: Record<string, any>; options?: any; columns?: any; format?: string; resource: string },
        cdnRewrite?: (url: string) => string
    ): Promise<{ buffer: Buffer; fileName: string; mimeType: string; totalRecords: number }> {
        const columns = this.resolveColumns(payload.columns);
        const headers = columns.map(c => c.label || c.key);

        // 1. Fetch ALL data
        const allRows: any[] = [];
        const allTranslations: any[] = [];
        let page = 1;
        const pageSize = 500; // Chunk size

        while (true) {
            // We use our own fetchPage which returns flattened items
            // But we need to handle the translations separately effectively
            // Since fetchPage flattens products -> variants, we might get duplicates for translations if we aren't careful?
            // Actually, fetchPage returns [Product + Variant1, Product + Variant2].
            // We can just rely on fetchPage for the Main Template Sheet.
            // For Translations, we might need to extract them from the raw products before flattening?
            // But fetchPage returns flattened items directly.
            //
            // HACK: To avoid refactoring fetchPage entirely, I'll modify fetchPage to return raw products?
            // No, BaseExportHandler expects ExportPageResult.
            //
            // Alternative: Re-implement the fetch loop here using the repository directly.
            // This gives me full control.

            const normalizedFilters = this.normalizeFilters(payload.filters);
            const result = await this.productRepository.findAll({
                page,
                limit: pageSize,
                filters: normalizedFilters,
                relations: [
                    'brand',
                    'productCategories',
                    'productCategories.category',
                    'variants',
                    'variants.variantItems',
                    'variants.variantItems.attribute',
                    'variants.variantItems.attributeValue',
                    'media',
                    'translations' // Ensure translations are fetched
                ],
            });

            if (!result.items.length) {
                break;
            }

            // Process products for Template Sheet
            for (const product of result.items) {
                const variants = (product.variants || []);
                const mediaUrls = (product.media || [])
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map(m => m.url)
                    .join(', ');

                const categoryIds = (product.productCategories || [])
                    .map(pc => pc.categoryId)
                    .filter(Boolean)
                    .join(', ');

                // Collect translations
                if (product.translations && product.translations.length > 0) {
                    for (const t of product.translations) {
                        allTranslations.push({
                            'Product ID': product.id,
                            'Locale': t.locale,
                            'Name': t.name,
                            'Description': t.description,
                            'Short Description': t.shortDescription,
                            'Slug': t.slug,
                            'SEO Title': t.metaTitle,
                            'SEO Description': t.metaDescription,
                            'Meta Keywords': t.metaKeywords
                        });
                    }
                }

                if (variants.length === 0) {
                    allRows.push(this.transformRecord({
                        ...product,
                        variantName: '',
                        variantSku: '',
                        variantPrice: '',
                        variantStock: '',
                        variantAttributes: '',
                        images: mediaUrls,
                        categoryIds,
                    }));
                } else {
                    for (const variant of variants) {
                        const attributes = (variant.variantItems || [])
                            .map(vi => `${vi.attribute?.name}:${vi.attributeValue?.value}`)
                            .join('|');

                        allRows.push(this.transformRecord({
                            ...product,
                            images: mediaUrls,
                            categoryIds,
                            variantName: variant.name,
                            variantSku: variant.sku,
                            variantPrice: variant.price,
                            variantStock: variant.stockQuantity,
                            variantAttributes: attributes,
                        }));
                    }
                }
            }

            if (result.items.length < pageSize) {
                break;
            }
            page++;
        }

        // 2. Build Workbook using XLSX
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Template (Data)
        // Map rows to match headers specifically? transformRecord returns object with keys.
        // We need to map keys to Header Labels.
        const templateData = allRows.map(row => {
            const mapped: Record<string, any> = {};
            columns.forEach(col => {
                mapped[col.label || col.key] = row[col.key];
            });
            return mapped;
        });

        const templateSheet = XLSX.utils.json_to_sheet(templateData, { header: headers });
        XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

        // Sheet 2: Instructions (Static)
        const instructionsData = [
            ['Product Import Instructions'],
            [''],
            ['1. BASIC INFO'],
            ['- Product ID: UUID (leave empty for new, fill to update)'],
            ['- Name: Required'],
            ['- SKU: Unique Product Code (Required)'],
            ['- Status: DRAFT, PUBLISHED, ARCHIVED'],
            [''],
            ['2. PRICING & INVENTORY'],
            ['- Price: Number'],
            ['- Compare At Price: Original price before discount'],
            ['- Stock Quantity: Number'],
            ['- Track Inventory: true/false'],
            [''],
            ['3. CLASSIFICATION'],
            ['- Brand ID: UUID of brand'],
            ['- Category IDs: Comma separated UUIDs'],
            [''],
            ['4. SETTINGS'],
            ['- Is Featured: true/false'],
            ['- Contact Price: true/false (Hide price, show contact button)'],
            ['- Is Active: true/false'],
            ['- Images: Comma separated URLs'],
            [''],
            ['5. TRANSLATIONS SHEET'],
            ['- Use this sheet for multi-language support'],
            ['- Product ID: UUID of the product (Required)'],
            ['- Locale: Language code (en, vi, ...)'],
            ['- Translatable fields: Name, Description, Short Description, SEO Title...'],
        ];
        const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
        XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

        // Sheet 3: Translations (Data)
        const translationHeaders = [
            'Product ID', 'Locale', 'Name', 'Description', 'Short Description',
            'Slug', 'SEO Title', 'SEO Description', 'Meta Keywords'
        ];

        const translationsSheet = XLSX.utils.json_to_sheet(allTranslations, { header: translationHeaders });
        XLSX.utils.book_append_sheet(workbook, translationsSheet, 'Translations');

        // 3. Generate Buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        const fileName = payload.options?.fileName || `product-import-template-${new Date().toISOString().split('T')[0]}.xlsx`;

        return {
            buffer,
            fileName: fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            totalRecords: allRows.length,
        };
    }
}
