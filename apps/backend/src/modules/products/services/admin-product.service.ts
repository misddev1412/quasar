import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProductRepository, ProductFilters, PaginatedProducts } from '../repositories/product.repository';
import { ProductMediaRepository, CreateProductMediaDto } from '../repositories/product-media.repository';
import { ProductVariantRepository, CreateProductVariantDto, UpdateProductVariantDto } from '../repositories/product-variant.repository';
import { ProductSpecificationRepository, CreateProductSpecificationDto } from '../repositories/product-specification.repository';
import { ProductWarehouseQuantityRepository } from '../repositories/product-warehouse-quantity.repository';
import { AttributeRepository } from '../repositories/attribute.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductPriceHistory } from '../entities/product-price-history.entity';
import { ProductVariantPriceHistory } from '../entities/product-variant-price-history.entity';
import { MediaType } from '../entities/product-media.entity';
import { ApiStatusCodes } from '@shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTransformer, TransformedProduct } from '../transformers/product.transformer';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as path from 'path';
import { FileUploadService } from '@backend/modules/storage/services/file-upload.service';
import { MediaService } from '@backend/modules/storage/services/media.service';
import {
  DataExportService,
  ExportFormat,
  ExportJobRunnerService,
  ExportJobPayload,
} from '@backend/modules/export';
import { PRODUCT_EXPORT_COLUMNS, PRODUCT_TEMPLATE_EXPORT_COLUMNS } from '../export/product-export.columns';
import { ImportJobService } from '../../import/services/import-job.service';
import slugify from 'slugify';

export interface AdminProductFilters {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryIds?: string[];
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface ProductStatsResponse {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  discontinuedProducts: number;
  featuredProducts: number;
  totalStockValue: number;
  averagePrice: number;
  totalViews: number;
  totalSoldUnits: number;
  totalReviews: number;
  averageRating: number;
  categoryStats: Record<string, number>;
  brandStats: Record<string, number>;
  recentProducts: Product[];
  topViewedProducts: Product[];
  topSellingProducts: Product[];
  topRatedProducts: Product[];
}

export interface ImportProductsFromExcelParams {
  fileName: string;
  fileData: string;
  overrideExisting?: boolean;
  dryRun?: boolean;
  defaultStatus?: ProductStatus;
  defaultIsActive?: boolean;
  actorId?: string | null;
}

export interface ImportProductsFromExcelResult {
  totalRows: number;
  imported: number;
  skipped: number;
  duplicates: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
  createdProductIds: string[];
  updatedProductIds: string[];
  details: Array<{
    row: number;
    productName: string;
    status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'ERROR';
    message?: string;
  }>;
  translationImported?: number;
  translationUpdated?: number;
  translationSkipped?: number;
  translationDuplicates?: number;
}

interface ReuploadedImageResult {
  sourceUrl: string;
  uploadedUrl: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class AdminProductService {
  private static readonly UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  private readonly vietnameseCharMap: Record<string, string> = {
    đ: 'd',
    Đ: 'D',
    ă: 'a',
    Ă: 'A',
    â: 'a',
    Â: 'A',
    ê: 'e',
    Ê: 'E',
    ô: 'o',
    Ô: 'O',
    ơ: 'o',
    Ơ: 'O',
    ư: 'u',
    Ư: 'U',
    ý: 'y',
    Ý: 'Y',
  };

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMediaRepository: ProductMediaRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productSpecificationRepository: ProductSpecificationRepository,
    private readonly productWarehouseQuantityRepository: ProductWarehouseQuantityRepository,
    private readonly attributeRepository: AttributeRepository,
    private readonly responseHandler: ResponseService,
    private readonly productTransformer: ProductTransformer,
    private readonly fileUploadService: FileUploadService,
    private readonly mediaService: MediaService,
    private readonly dataExportService: DataExportService,
    private readonly exportJobRunnerService: ExportJobRunnerService,
    @InjectRepository(ProductPriceHistory)
    private readonly productPriceHistoryRepository: Repository<ProductPriceHistory>,
    @InjectRepository(ProductVariantPriceHistory)
    private readonly productVariantPriceHistoryRepository: Repository<ProductVariantPriceHistory>,
    private readonly importJobService: ImportJobService,
  ) { }

  private isUuid(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return AdminProductService.UUID_REGEX.test(value.trim());
  }

  private async findProductByIdentifier(identifier: string, relations: string[] = []): Promise<Product | null> {
    const normalized = typeof identifier === 'string' ? identifier.trim() : '';
    if (!normalized) {
      return null;
    }

    if (this.isUuid(normalized)) {
      return this.productRepository.findById(normalized, relations);
    }

    return this.productRepository.findBySlug(normalized, relations);
  }

  private async resolveProductId(identifier: string): Promise<string | null> {
    const normalized = typeof identifier === 'string' ? identifier.trim() : '';
    if (!normalized) {
      return null;
    }

    if (this.isUuid(normalized)) {
      return normalized;
    }

    const product = await this.productRepository.findBySlug(normalized);
    return product?.id ?? null;
  }

  async generateExcelTemplate(locale: string = 'en'): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    const isVi = locale === 'vi';

    // 1. Template Sheet
    const templateHeaders = isVi ? [
      'Mã sản phẩm',
      'Tên sản phẩm',
      'SKU',
      'Mô tả',
      'Mô tả ngắn',
      'Trạng thái',
      'Giá bán',
      'Giá gốc (So sánh)',
      'Giá niêm yết',
      'Số lượng tồn',
      'Bật kho hàng',
      'Mã thương hiệu',
      'Mã bảo hành',
      'Nổi bật',
      'Liên hệ báo giá',
      'Kích hoạt',
      'Hình ảnh (ngăn cách bởi dấu phẩy)',
      'Danh mục (UUIDs ngăn cách bởi dấu phẩy)',
    ] : [
      'Product ID',
      'Name',
      'SKU',
      'Description',
      'Short Description',
      'Status',
      'Price',
      'Compare At Price',
      'Cost Price',
      'Stock Quantity',
      'Track Inventory',
      'Brand ID',
      'Warranty ID',
      'Is Featured',
      'Contact Price',
      'Is Active',
      'Images (comma separated)',
      'Category IDs (comma separated)',
    ];

    const templateSample = isVi ? {
      'Mã sản phẩm': '',
      'Tên sản phẩm': 'Sản phẩm mẫu',
      'SKU': 'SP-001',
      'Mô tả': 'Mô tả chi tiết sản phẩm',
      'Mô tả ngắn': 'Mô tả ngắn gọn',
      'Trạng thái': 'PUBLISHED',
      'Giá bán': 100000,
      'Giá gốc (So sánh)': 120000,
      'Giá niêm yết': 80000,
      'Số lượng tồn': 100,
      'Bật kho hàng': 'true',
      'Mã thương hiệu': '',
      'Mã bảo hành': '',
      'Nổi bật': 'false',
      'Liên hệ báo giá': 'false',
      'Kích hoạt': 'true',
      'Hình ảnh (ngăn cách bởi dấu phẩy)': 'https://example.com/image1.jpg, https://example.com/image2.jpg',
      'Danh mục (UUIDs ngăn cách bởi dấu phẩy)': '',
    } : {
      'Product ID': '',
      'Name': 'Sample Product',
      'SKU': 'PROD-001',
      'Description': 'Detailed product description',
      'Short Description': 'Short summary',
      'Status': 'PUBLISHED',
      'Price': 100.00,
      'Compare At Price': 120.00,
      'Cost Price': 80.00,
      'Stock Quantity': 100,
      'Track Inventory': 'true',
      'Brand ID': '',
      'Warranty ID': '',
      'Is Featured': 'false',
      'Contact Price': 'false',
      'Is Active': 'true',
      'Images (comma separated)': 'https://example.com/image1.jpg, https://example.com/image2.jpg',
      'Category IDs (comma separated)': '',
    };

    const templateSheet = XLSX.utils.json_to_sheet([templateSample], { header: templateHeaders });
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

    // 2. Instructions Sheet
    const instructionsData = isVi ? [
      ['Hướng dẫn nhập sản phẩm'],
      [''],
      ['1. THÔNG TIN CƠ BẢN'],
      ['- Mã sản phẩm: UUID (để trống nếu tạo mới, điền vào nếu cập nhật)'],
      ['- Tên sản phẩm: Bắt buộc'],
      ['- SKU: Mã sản phẩm duy nhất (Bắt buộc)'],
      ['- Trạng thái: DRAFT (Nháp), PUBLISHED (Xuất bản), ARCHIVED (Lưu trữ)'],
      [''],
      ['2. GIÁ & KHO'],
      ['- Giá bán: Số (VNĐ)'],
      ['- Giá gốc (So sánh): Giá trước khi giảm'],
      ['- Số lượng tồn: Số lượng trong kho'],
      ['- Bật kho hàng: true/false (Có quản lý tồn kho không)'],
      [''],
      ['3. PHÂN LOẠI & LIÊN KẾT'],
      ['- Mã thương hiệu: UUID của thương hiệu'],
      ['- Danh mục: Danh sách UUID danh mục, ngăn cách bởi dấu phẩy'],
      [''],
      ['4. CÀI ĐẶT KHÁC'],
      ['- Nổi bật: true/false'],
      ['- Liên hệ báo giá: true/false (Ẩn giá, hiện nút liên hệ)'],
      ['- Kích hoạt: true/false'],
      ['- Hình ảnh: Danh sách URL ảnh, ngăn cách bởi dấu phẩy'],
      [''],
      ['5. SHEET BẢN DỊCH (Translations)'],
      ['- Dùng để nhập đa ngôn ngữ cho sản phẩm'],
      ['- Mã sản phẩm: UUID của sản phẩm cần dịch (Bắt buộc)'],
      ['- Ngôn ngữ: Mã ngôn ngữ (vi, en, ...)'],
      ['- Các trường có thể dịch: Tên, Mô tả, Mô tả ngắn, Tiêu đề SEO, Mô tả SEO...'],
    ] : [
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

    // 3. Translations Sheet
    const translationHeaders = isVi ? [
      'Mã sản phẩm',
      'Ngôn ngữ',
      'Tên sản phẩm',
      'Mô tả',
      'Mô tả ngắn',
      'Đường dẫn (Slug)',
      'Tiêu đề SEO',
      'Mô tả SEO',
      'Từ khóa SEO'
    ] : [
      'Product ID',
      'Locale',
      'Name',
      'Description',
      'Short Description',
      'Slug',
      'SEO Title',
      'SEO Description',
      'Meta Keywords'
    ];

    const translationSample = isVi ? {
      'Mã sản phẩm': '',
      'Ngôn ngữ': 'en',
      'Tên sản phẩm': 'Product Name',
      'Mô tả': 'Product Description',
      'Mô tả ngắn': 'Short Description',
      'Đường dẫn (Slug)': 'product-slug-en',
      'Tiêu đề SEO': 'SEO Title',
      'Mô tả SEO': 'SEO Description',
      'Từ khóa SEO': 'keyword1, keyword2'
    } : {
      'Product ID': '',
      'Locale': 'vi',
      'Name': 'Tên sản phẩm',
      'Description': 'Mô tả sản phẩm',
      'Short Description': 'Mô tả ngắn',
      'Slug': 'bep-tu-doi',
      'SEO Title': 'Tiêu đề SEO',
      'SEO Description': 'Mô tả SEO',
      'Meta Keywords': 'tu khoa 1, tu khoa 2'
    };

    const translationsSheet = XLSX.utils.json_to_sheet([translationSample], { header: translationHeaders });
    XLSX.utils.book_append_sheet(workbook, translationsSheet, 'Translations');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getAllProducts(filters: AdminProductFilters) {
    try {
      // Get products using repository with all relations like detail endpoint
      const result = await this.productRepository.findAll({
        page: filters.page,
        limit: filters.limit,
        relations: ['media', 'variants', 'variants.variantItems', 'variants.variantItems.attribute', 'variants.variantItems.attributeValue', 'brand', 'productCategories', 'productCategories.category', 'specifications'],
        filters: {
          search: filters.search,
          brandId: filters.brandId,
          categoryIds: filters.categoryIds,
          status: filters.status,
          isActive: filters.isActive,
          isFeatured: filters.isFeatured,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          hasStock: filters.hasStock,
          createdFrom: filters.createdFrom,
          createdTo: filters.createdTo,
        }
      });


      // Transform products to consistent frontend format
      const transformedItems = await this.productTransformer.transformProducts(result.items);

      const finalResult = {
        items: transformedItems,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };

      return finalResult;

    } catch (error) {

      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve products: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  private generateProductSlug(text?: string, fallbackBase: string = 'product'): string {
    const source = (text || '').trim();
    let slug = slugify(source || fallbackBase, {
      lower: true,
      strict: false,
      trim: true,
      replacement: '-',
      remove: /[*+~()'"]/g,
      locale: 'vi',
    });

    Object.keys(this.vietnameseCharMap).forEach(char => {
      const regex = new RegExp(char, 'g');
      slug = slug.replace(regex, this.vietnameseCharMap[char]);
    });

    slug = slug
      .replace(/[,;.:!?@#$%^&<>{}[\]\\|`=]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = `${fallbackBase}-${Date.now()}`;
    }

    return slug.substring(0, 120).replace(/-+$/, '');
  }

  private async ensureUniqueProductSlug(baseSlug: string, excludeId?: string): Promise<string> {
    const safeBase = baseSlug && baseSlug.trim().length > 0 ? baseSlug.trim() : `product-${Date.now()}`;
    let slug = safeBase;
    let counter = 1;

    while (true) {
      const existing = await this.productRepository.findBySlug(slug);
      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }

      slug = `${safeBase}-${counter}`;
      counter += 1;
    }
  }

  async getProductById(
    id: string,
    relations: string[] = [
      'media',
      'variants',
      'variants.variantItems',
      'variants.variantItems.attribute',
      'variants.variantItems.attributeValue',
      'brand',
      'productCategories',
      'productCategories.category',
      'specifications',
      'translations',
    ],
  ): Promise<TransformedProduct> {
    const product = await this.findProductByIdentifier(id, relations);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Transform product to consistent frontend format
    return await this.productTransformer.transformProduct(product);
  }

  async getVariantById(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return this.productTransformer.transformVariant(variant);
  }

  async updateVariant(id: string, variantData: UpdateProductVariantDto) {
    try {
      const existingVariant = await this.productVariantRepository.findById(id);
      if (!existingVariant) {
        throw new NotFoundException('Product variant not found');
      }

      const updatedVariant = await this.productVariantRepository.update(id, variantData);

      // Track price history if changed
      const priceChanged = variantData.price !== undefined && Number(variantData.price) !== Number(existingVariant.price);
      const compareAtPriceChanged = variantData.compareAtPrice !== undefined && Number(variantData.compareAtPrice) !== Number(existingVariant.compareAtPrice);

      if (priceChanged || compareAtPriceChanged) {
        await this.productVariantPriceHistoryRepository.save({
          variantId: id,
          price: updatedVariant.price,
          compareAtPrice: updatedVariant.compareAtPrice,
          createdBy: null,
        });
      }

      return this.productTransformer.transformVariant(updatedVariant);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update product variant',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      // Check for duplicate SKU if provided
      if (productData.sku) {
        const existingProduct = await this.productRepository.findBySku(productData.sku);
        if (existingProduct) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Product with this SKU already exists',
            'CONFLICT'
          );
        }
      }

      // Helper function to handle empty strings and convert to null
      const cleanUuid = (value: any) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return null;
        }
        return value;
      };
      const cleanText = (value: any): string | null => {
        if (typeof value !== 'string') {
          return null;
        }
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      // Transform the data to match the entity structure
      const transformedData: Partial<Product> = {
        name: productData.name,
        description: cleanText(productData.description),
        shortDescription: cleanText(productData.shortDescription),
        sku: productData.sku || null,
        status: productData.status || 'DRAFT',
        price: productData.price !== undefined ? productData.price : 0,
        compareAtPrice: productData.compareAtPrice !== undefined && productData.compareAtPrice !== null
          ? productData.compareAtPrice
          : null,
        brandId: cleanUuid(productData.brandId),
        warrantyId: cleanUuid(productData.warrantyId),
        metaTitle: productData.metaTitle || null,
        metaDescription: productData.metaDescription || null,
        metaKeywords: productData.metaKeywords || null,
        ogImage: productData.ogImage || null,
        isFeatured: productData.isFeatured || false,
        isContactPrice: productData.isContactPrice || false,
        stockQuantity: productData.stockQuantity !== undefined ? productData.stockQuantity : 0,
        enableWarehouseQuantity: productData.enableWarehouseQuantity || false,
        isActive: true, // Default to active
      };

      const slugSource = typeof productData.slug === 'string' ? productData.slug.trim() : '';
      const normalizedSlug = this.generateProductSlug(slugSource || productData.name || 'product');
      const ensuredSlug = await this.ensureUniqueProductSlug(normalizedSlug);
      transformedData.slug = ensuredSlug;

      // Handle media - will be processed after product creation

      // For now, skip tags and variants processing - these will need separate handling
      // as they involve relations that should be created after the product is saved

      const product = await this.productRepository.create(transformedData);
      if (ensuredSlug && product.slug !== ensuredSlug) {
        await this.productRepository.update(product.id, { slug: ensuredSlug });
        product.slug = ensuredSlug;
      }

      // Handle media creation
      if (productData.media && Array.isArray(productData.media)) {
        await this.handleProductMedia(product.id, productData.media);
      }

      if (productData.specifications && Array.isArray(productData.specifications)) {
        await this.handleProductSpecifications(product.id, productData.specifications);
      }

      // Handle variants creation
      if (productData.variants && Array.isArray(productData.variants)) {
        await this.handleProductVariants(product.id, productData.variants);
      }

      // Handle category assignments
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        await this.handleProductCategories(product.id, productData.categoryIds);
      }

      // Handle warehouse quantities
      if (productData.enableWarehouseQuantity && productData.warehouseQuantities && Array.isArray(productData.warehouseQuantities)) {
        await this.handleWarehouseQuantities(product.id, productData.warehouseQuantities);
      }

      // TODO: Handle tags after product creation
      // This would require additional service methods to create related entities

      return product;
    } catch (error) {
      if (error.statusCode === ApiStatusCodes.CONFLICT) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to create product',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    try {
      // Helper function to handle empty strings and convert to null
      const cleanUuid = (value: any) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return null;
        }
        return value;
      };
      const cleanText = (value: any): string | null => {
        if (typeof value !== 'string') {
          return null;
        }
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      // Transform the data to match the entity structure
      const transformedData: Partial<Product> = {
        name: productData.name,
        description: cleanText(productData.description),
        shortDescription: cleanText(productData.shortDescription),
        sku: productData.sku || null,
        status: productData.status || 'DRAFT',
        price: productData.price !== undefined ? productData.price : existingProduct.price,
        compareAtPrice: productData.compareAtPrice !== undefined
          ? productData.compareAtPrice
          : existingProduct.compareAtPrice ?? null,
        brandId: cleanUuid(productData.brandId),
        warrantyId: cleanUuid(productData.warrantyId),
        metaTitle: productData.metaTitle || null,
        metaDescription: productData.metaDescription || null,
        metaKeywords: productData.metaKeywords || null,
        ogImage: productData.ogImage || null,
        isFeatured: productData.isFeatured || false,
        isContactPrice: productData.isContactPrice !== undefined ? productData.isContactPrice : existingProduct.isContactPrice,
        stockQuantity: productData.stockQuantity !== undefined ? productData.stockQuantity : existingProduct.stockQuantity,
        enableWarehouseQuantity: productData.enableWarehouseQuantity !== undefined ? productData.enableWarehouseQuantity : existingProduct.enableWarehouseQuantity,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
      };

      const providedSlugValue = typeof productData.slug === 'string' ? productData.slug.trim() : undefined;
      const fallbackSlugSource = productData.name || existingProduct.name || 'product';

      if (providedSlugValue !== undefined) {
        if (providedSlugValue.length === 0) {
          transformedData.slug = await this.ensureUniqueProductSlug(
            this.generateProductSlug(fallbackSlugSource),
            id,
          );
        } else if (providedSlugValue !== existingProduct.slug) {
          transformedData.slug = await this.ensureUniqueProductSlug(
            this.generateProductSlug(providedSlugValue),
            id,
          );
        } else {
          transformedData.slug = existingProduct.slug;
        }
      } else if (!existingProduct.slug) {
        transformedData.slug = await this.ensureUniqueProductSlug(
          this.generateProductSlug(fallbackSlugSource),
          id,
        );
      }

      // Handle media - will be processed after product update

      // Check for duplicate SKU if updating SKU
      if (transformedData.sku && transformedData.sku !== existingProduct.sku) {
        const duplicateProduct = await this.productRepository.findBySku(transformedData.sku);
        if (duplicateProduct && duplicateProduct.id !== id) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Product with this SKU already exists',
            'CONFLICT'
          );
        }
      }

      const updatedProduct = await this.productRepository.update(id, transformedData);
      if (!updatedProduct) {
        throw new NotFoundException('Product not found after update');
      }
      if (transformedData.slug && updatedProduct.slug !== transformedData.slug) {
        updatedProduct.slug = transformedData.slug;
      }

      // Handle media update
      if (productData.media && Array.isArray(productData.media)) {
        await this.handleProductMedia(id, productData.media);
      }

      if (productData.specifications !== undefined) {
        if (Array.isArray(productData.specifications)) {
          await this.handleProductSpecifications(id, productData.specifications);
        } else {
          await this.productSpecificationRepository.deleteByProductId(id);
        }
      }

      // Handle variants update - only if variants are explicitly provided
      if (productData.variants !== undefined) {
        if (Array.isArray(productData.variants)) {
          await this.handleProductVariants(id, productData.variants);
        } else {
          // If variants is not an array, delete all existing variants
          await this.productVariantRepository.deleteByProductId(id);
        }
      }

      // Handle category assignments - only if categoryIds are explicitly provided
      if (productData.categoryIds !== undefined) {
        if (Array.isArray(productData.categoryIds)) {
          await this.handleProductCategories(id, productData.categoryIds);
        } else {
          // If categoryIds is not an array, clear all category assignments
          await this.handleProductCategories(id, []);
        }
      }

      // Handle warehouse quantities - only if explicitly provided
      if (productData.warehouseQuantities !== undefined) {
        if (productData.enableWarehouseQuantity && Array.isArray(productData.warehouseQuantities)) {
          await this.handleWarehouseQuantities(id, productData.warehouseQuantities);
        } else {
          // If not using warehouse quantities, clear them
          await this.productWarehouseQuantityRepository.deleteByProductId(id);
        }
      }

      // Track price history if changed
      const priceChanged = transformedData.price !== undefined && Number(transformedData.price) !== Number(existingProduct.price);
      const compareAtPriceChanged = transformedData.compareAtPrice !== undefined && Number(transformedData.compareAtPrice) !== Number(existingProduct.compareAtPrice);
      // Note: isContactPrice is not yet editable in updateProduct in this code version, skipping for now or adding if available

      if (priceChanged || compareAtPriceChanged) {
        await this.productPriceHistoryRepository.save({
          productId: id,
          price: updatedProduct.price,
          compareAtPrice: updatedProduct.compareAtPrice,
          isContactPrice: updatedProduct.isContactPrice,
          createdBy: null, // User tracking not yet implemented in this context
        });
      }

      return updatedProduct;
    } catch (error) {
      if (error.statusCode === ApiStatusCodes.CONFLICT) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update product',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      return await this.productRepository.delete(id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to delete product',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async bulkUpdateStatus(ids: string[], status: ProductStatus): Promise<{ updated: number }> {
    try {
      const updated = await this.productRepository.bulkUpdateStatus(ids, status);
      return { updated };
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to bulk update product status',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    try {
      const deleted = await this.productRepository.bulkDelete(ids);
      return { deleted };
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to bulk delete products',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProductStats(): Promise<ProductStatsResponse> {
    try {
      return await this.productRepository.getStats();
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve product statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateProductStatus(id: string, isActive: boolean): Promise<Product> {
    return this.updateProduct(id, { isActive });
  }

  async importProductsFromExcel(params: ImportProductsFromExcelParams): Promise<{ jobId: string }> {
    const {
      fileData,
      fileName,
      overrideExisting = false,
      dryRun = false,
      defaultStatus = ProductStatus.DRAFT,
      defaultIsActive = true,
      actorId,
    } = params;

    if (!fileData || fileData.trim().length === 0) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'File data is required for import',
        'BAD_REQUEST',
      );
    }

    // Create a new import job
    const job = await this.importJobService.createJob('products', fileName, actorId ?? undefined);

    // Run processing in background
    (async () => {
      const summary: ImportProductsFromExcelResult = {
        totalRows: 0,
        imported: 0,
        skipped: 0,
        duplicates: 0,
        updated: 0,
        errors: [],
        createdProductIds: [],
        updatedProductIds: [],
        details: [],
        translationImported: 0,
        translationUpdated: 0,
        translationSkipped: 0,
        translationDuplicates: 0,
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
          throw this.responseHandler.createError(
            ApiStatusCodes.BAD_REQUEST,
            'Invalid file content. Expected base64 encoded data.',
            'BAD_REQUEST',
          );
        }
      };

      const buffer = toBuffer(fileData);

      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(buffer, { type: 'buffer' });
      } catch (error) {
        throw this.responseHandler.createError(
          ApiStatusCodes.BAD_REQUEST,
          `Unable to read Excel file${fileName ? ` ${fileName}` : ''}. Please ensure the file is a valid .xlsx or .xls document.`,
          'BAD_REQUEST',
        );
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw this.responseHandler.createError(
          ApiStatusCodes.BAD_REQUEST,
          'The uploaded workbook does not contain any sheets.',
          'BAD_REQUEST',
        );
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!worksheet) {
        throw this.responseHandler.createError(
          ApiStatusCodes.BAD_REQUEST,
          'The first sheet of the workbook is empty or unreadable.',
          'BAD_REQUEST',
        );
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: false,
        blankrows: false,
      });

      if (!rawRows.length) {
        throw this.responseHandler.createError(
          ApiStatusCodes.BAD_REQUEST,
          'No data rows found in the uploaded file.',
          'BAD_REQUEST',
        );
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

      const normalizedKeyToHeader = new Map<string, string>();
      const normalizedRows = rawRows.map((row) => {
        const normalizedEntry: Record<string, any> = {};
        Object.entries(row).forEach(([header, value]) => {
          const normalizedKey = normalizeKey(header);
          if (normalizedKey) {
            normalizedEntry[normalizedKey] = value;
            if (!normalizedKeyToHeader.has(normalizedKey)) {
              normalizedKeyToHeader.set(normalizedKey, header);
            }
          }
        });
        return normalizedEntry;
      });

      const columnMap: Record<string, string[]> = {
        name: ['name', 'productname', 'tensanpham'],
        sku: ['sku', 'productsku', 'masp', 'masanpham'],
        description: ['description', 'productdescription', 'mota', 'motasanpham'],
        status: ['status', 'trangthai'],
        isActive: ['isactive', 'kichhoat', 'active'],
        isFeatured: ['isfeatured', 'noibat', 'featured'],
        brandId: ['brandid', 'brand', 'mathuonghieu', 'thuonghieu'],
        categoryIds: ['categoryids', 'categories', 'category', 'danhmuc', 'danhsachdanhmuc', 'danhmucuuidsngancachboidauphay', 'categoryidscommaseparated'],
        tags: ['tags', 'nhan', 'tukhoa'],
        variantName: ['variantname', 'tenphienban', 'variationname'],
        variantSku: ['variantsku', 'skuvariant', 'maphienban'],
        variantBarcode: ['variantbarcode', 'barcode', 'mabarcode'],
        price: ['price', 'gia', 'productprice', 'variantprice', 'giaban'],
        compareAtPrice: ['compareatprice', 'compareprice', 'giacu', 'giathamchieu', 'giagocsosanh'],
        costPrice: ['costprice', 'giavon', 'cost', 'gianiemyet'],
        stockQuantity: ['stockquantity', 'tonkho', 'soluong', 'inventory', 'soluongton'],
        lowStockThreshold: ['lowstockthreshold', 'canhbaoton', 'nguongcanhbao'],
        trackInventory: ['trackinventory', 'theodoiton', 'quanlyton', 'batkhohang'],
        allowBackorders: ['allowbackorders', 'chophephethang', 'chophepbackorder'],
        productImageUrls: ['productimage', 'productimages', 'productimageurl', 'productimageurls', 'image', 'images', 'imageurl', 'imageurls', 'anh', 'hinhanh', 'hinhanhsanpham', 'hinhanhngancachboidauphay', 'imagescommaseparated'],
        variantImageUrl: ['variantimage', 'variantimages', 'variantimageurl', 'variantimageurls', 'anhphienban', 'hinhanhphienban', 'variantthumbnail', 'variantthumbnailurl', 'thumbnailvariant', 'thumbnailvarianturl'],
        variantSortOrder: ['variantsortorder', 'variantsort', 'variantorder', 'sapxepvariant'],
        variantIsActive: ['variantisactive', 'variantactive', 'kichhoatvariant', 'activevariant'],
      };

      const knownColumnKeys = new Set<string>();
      Object.values(columnMap).forEach((keys) => {
        keys.forEach((key) => knownColumnKeys.add(key));
      });

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

      const parseStatus = (value: any): ProductStatus => {
        if (value === undefined || value === null || normalizeString(value) === '') {
          return defaultStatus;
        }

        const normalized = normalizeKey(String(value));
        switch (normalized) {
          case 'active':
          case 'kichhoat':
          case 'dangban':
          case 'ban':
            return ProductStatus.ACTIVE;
          case 'inactive':
          case 'ngunghoatdong':
          case 'tamdung':
            return ProductStatus.INACTIVE;
          case 'discontinued':
          case 'ngunghoanly':
          case 'hetban':
            return ProductStatus.DISCONTINUED;
          case 'draft':
          case 'nhap':
          case 'banthao':
            return ProductStatus.DRAFT;
          default:
            return defaultStatus;
        }
      };

      const parseCategories = (value: any): string[] => {
        const normalizedValue = normalizeString(value);
        if (!normalizedValue) {
          return [];
        }
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
        return normalizedValue
          .split(/[;,|]/)
          .map((part) => normalizeString(removeDiacritics(part)).replace(/[^a-zA-Z0-9-]/g, ''))
          .filter((part) => uuidRegex.test(part));
      };

      const parseImageUrls = (value: any): string[] => {
        const normalizedValue = normalizeString(value);
        if (!normalizedValue) {
          return [];
        }

        const potentialUrls = normalizedValue
          .split(/[\n\r;,|]+/)
          .map((part) => part.trim())
          .filter(Boolean);

        const httpRegex = /^https?:\/\//i;
        const cleanedUrls = potentialUrls
          .map((candidate) => candidate.replace(/\s+/g, ''))
          .filter((candidate) => httpRegex.test(candidate));

        return Array.from(new Set(cleanedUrls));
      };

      const parseFirstImageUrl = (value: any): string | null => {
        const urls = parseImageUrls(value);
        return urls.length > 0 ? urls[0] : null;
      };

      const selectAttributes = await this.attributeRepository.getSelectAttributes();

      const attributeLookupByKey = new Map<string, { attribute: any; valueLookup: Map<string, any> }>();
      const attributeValueById = new Map<string, any>();

      for (const attribute of selectAttributes) {
        const rawValues = (attribute as any).values;
        const values: any[] = Array.isArray(rawValues) ? rawValues : await rawValues;

        const valueLookup = new Map<string, any>();
        values.forEach((value) => {
          if (value && value.id) {
            attributeValueById.set(String(value.id).toLowerCase(), value);
          }
          const normalizedValue = normalizeKey(value?.value || '');
          if (normalizedValue) {
            valueLookup.set(normalizedValue, value);
          }
          const normalizedDisplayValue = normalizeKey(value?.displayValue || '');
          if (normalizedDisplayValue) {
            valueLookup.set(normalizedDisplayValue, value);
          }
        });

        const info = { attribute, valueLookup };
        const attributeKeys = [
          normalizeKey(attribute?.name || ''),
          normalizeKey(attribute?.displayName || ''),
          normalizeKey(attribute?.code || ''),
          normalizeKey(attribute?.id || ''),
        ].filter((key) => key);

        attributeKeys.forEach((key) => {
          if (!attributeLookupByKey.has(key)) {
            attributeLookupByKey.set(key, info);
          }
        });
      }

      const variantAttributePrefixes = ['variantattribute', 'variantattr', 'variantoption', 'thuoctinhphienban', 'thuoctinhbien'];
      const extractVariantAttributeKey = (normalizedKey: string): string | null => {
        for (const prefix of variantAttributePrefixes) {
          if (normalizedKey.startsWith(prefix) && normalizedKey.length > prefix.length) {
            return normalizedKey.slice(prefix.length);
          }
        }
        return null;
      };

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const productGroups = new Map<string, {
        productData: any;
        categoryIds: Set<string>;
        tags: Set<string>;
        productImageUrls: Set<string>;
        variants: Array<{ rowNumber: number; variant: any; sourceImageUrl: string | null; sortOrderProvided: boolean }>;
        rowNumbers: number[];
      }>();

      for (let index = 0; index < normalizedRows.length; index += 1) {
        const row = normalizedRows[index];
        const spreadsheetRowNumber = index + 1;

        const rawName = getFromRow(row, columnMap.name);
        const name = normalizeString(rawName);

        if (!name) {
          summary.skipped += 1;
          summary.errors.push({
            row: spreadsheetRowNumber,
            message: 'Missing required field: product name',
          });
          summary.details.push({
            row: spreadsheetRowNumber,
            productName: 'Unknown',
            status: 'ERROR',
            message: 'Missing required field: product name',
          });
          continue;
        }

        const skuValue = getFromRow(row, columnMap.sku);
        const sku = normalizeString(skuValue) || null;

        const productKey = sku ? `sku:${normalizeKey(sku)}` : `name:${normalizeKey(name) || name.toLowerCase()}`;

        const description = normalizeString(getFromRow(row, columnMap.description)) || null;
        const status = parseStatus(getFromRow(row, columnMap.status));
        const isActive = parseBoolean(getFromRow(row, columnMap.isActive), defaultIsActive);
        const isFeatured = parseBoolean(getFromRow(row, columnMap.isFeatured), false);
        const brandIdRaw = normalizeString(getFromRow(row, columnMap.brandId));
        const brandId = brandIdRaw || null;
        const categoryIds = parseCategories(getFromRow(row, columnMap.categoryIds));
        const tagsRaw = normalizeString(getFromRow(row, columnMap.tags));
        const tags = tagsRaw
          ? tagsRaw
            .split(/[;,|]/)
            .map((tag) => normalizeString(tag))
            .filter(Boolean)
          : [];

        const productImageUrls = parseImageUrls(getFromRow(row, columnMap.productImageUrls));

        const variantName = normalizeString(getFromRow(row, columnMap.variantName)) || `${name} Variant`;
        const variantSku = normalizeString(getFromRow(row, columnMap.variantSku)) || (sku || null);
        const variantBarcode = normalizeString(getFromRow(row, columnMap.variantBarcode)) || null;
        const price = parseNumber(getFromRow(row, columnMap.price));

        const compareAtPriceRaw = getFromRow(row, columnMap.compareAtPrice);
        const compareAtPrice = compareAtPriceRaw !== undefined && compareAtPriceRaw !== null && normalizeString(compareAtPriceRaw) !== ''
          ? parseNumber(compareAtPriceRaw, 0)
          : null;

        const costPriceRaw = getFromRow(row, columnMap.costPrice);
        const costPrice = costPriceRaw !== undefined && costPriceRaw !== null && normalizeString(costPriceRaw) !== ''
          ? parseNumber(costPriceRaw, 0)
          : null;
        const stockQuantity = parseNumber(getFromRow(row, columnMap.stockQuantity), 0);
        const lowStockThresholdRaw = getFromRow(row, columnMap.lowStockThreshold);
        const lowStockThresholdValue = lowStockThresholdRaw !== undefined && lowStockThresholdRaw !== null && normalizeString(lowStockThresholdRaw) !== ''
          ? parseNumber(lowStockThresholdRaw, 0)
          : null;
        const trackInventory = parseBoolean(getFromRow(row, columnMap.trackInventory), true);
        const allowBackorders = parseBoolean(getFromRow(row, columnMap.allowBackorders), false);
        const variantImageUrl = parseFirstImageUrl(getFromRow(row, columnMap.variantImageUrl));
        const variantIsActive = parseBoolean(getFromRow(row, columnMap.variantIsActive), true);
        const variantSortOrderRaw = getFromRow(row, columnMap.variantSortOrder);
        const variantSortOrder = variantSortOrderRaw !== undefined && variantSortOrderRaw !== null && normalizeString(variantSortOrderRaw) !== ''
          ? parseNumber(variantSortOrderRaw, 0)
          : undefined;

        const attributeItems: Array<{ attributeId: string; attributeValueId: string; sortOrder: number }> = [];
        const seenAttributeIds = new Set<string>();
        let attributeError = false;

        for (const [normalizedKey, cellValue] of Object.entries(row)) {
          if (knownColumnKeys.has(normalizedKey)) {
            continue;
          }
          const attributeKey = extractVariantAttributeKey(normalizedKey);
          if (!attributeKey) {
            continue;
          }

          const attributeInfo = attributeLookupByKey.get(attributeKey);
          if (!attributeInfo) {
            const header = normalizedKeyToHeader.get(normalizedKey) || attributeKey;
            summary.errors.push({
              row: spreadsheetRowNumber,
              message: `Unknown variant attribute '${header}'.`,
            });
            attributeError = true;
            continue;
          }

          if (seenAttributeIds.has(attributeInfo.attribute.id)) {
            summary.errors.push({
              row: spreadsheetRowNumber,
              message: `Attribute '${attributeInfo.attribute.displayName || attributeInfo.attribute.name}' is provided more than once for the same variant.`,
            });
            attributeError = true;
            continue;
          }

          const rawAttributeValue = normalizeString(cellValue);
          if (!rawAttributeValue) {
            continue;
          }

          let resolvedValue = null;
          if (uuidRegex.test(rawAttributeValue)) {
            const directValue = attributeValueById.get(rawAttributeValue.toLowerCase());
            if (directValue && directValue.attributeId === attributeInfo.attribute.id) {
              resolvedValue = directValue;
            }
          }

          if (!resolvedValue) {
            const normalizedValueKey = normalizeKey(rawAttributeValue);
            if (normalizedValueKey) {
              resolvedValue = attributeInfo.valueLookup.get(normalizedValueKey) || null;
            }
          }

          if (!resolvedValue) {
            summary.errors.push({
              row: spreadsheetRowNumber,
              message: `Invalid value '${rawAttributeValue}' for attribute '${attributeInfo.attribute.displayName || attributeInfo.attribute.name}'.`,
            });
            attributeError = true;
            continue;
          }

          seenAttributeIds.add(attributeInfo.attribute.id);
          attributeItems.push({
            attributeId: attributeInfo.attribute.id,
            attributeValueId: resolvedValue.id,
            sortOrder: attributeItems.length,
          });
        }

        if (attributeError) {
          summary.skipped += 1;
          continue;
        }

        let group = productGroups.get(productKey);
        if (!group) {
          const baseData: any = {
            name,
            description,
            sku,
            status,
            isActive,
            isFeatured,
          };
          if (brandId) {
            baseData.brandId = brandId;
          }

          group = {
            productData: baseData,
            categoryIds: new Set<string>(categoryIds),
            tags: new Set<string>(tags),
            productImageUrls: new Set<string>(productImageUrls),
            variants: [],
            rowNumbers: [],
          };

          productGroups.set(productKey, group);
        } else {
          categoryIds.forEach((id) => group.categoryIds.add(id));
          tags.forEach((tag) => group.tags.add(tag));
          productImageUrls.forEach((url) => group.productImageUrls.add(url));

          if (!group.productData.description && description) {
            group.productData.description = description;
          }

          if (!group.productData.brandId && brandId) {
            group.productData.brandId = brandId;
          }

          if (!group.productData.sku && sku) {
            group.productData.sku = sku;
          }

          if (isFeatured) {
            group.productData.isFeatured = true;
          }
        }

        group.rowNumbers.push(spreadsheetRowNumber);

        const sortOrderValue = variantSortOrder !== undefined && Number.isFinite(variantSortOrder)
          ? Math.round(variantSortOrder)
          : group.variants.length;

        group.variants.push({
          rowNumber: spreadsheetRowNumber,
          variant: {
            name: variantName,
            sku: variantSku || undefined,
            barcode: variantBarcode || undefined,
            price,
            compareAtPrice,
            costPrice,
            stockQuantity,
            lowStockThreshold: lowStockThresholdValue,
            trackInventory,
            allowBackorders,
            weight: null,
            dimensions: null,
            image: null,
            isActive: variantIsActive,
            sortOrder: sortOrderValue,
            variantItems: attributeItems.map((item, itemIndex) => ({
              attributeId: item.attributeId,
              attributeValueId: item.attributeValueId,
              sortOrder: item.sortOrder ?? itemIndex,
            })),
          },
          sourceImageUrl: variantImageUrl,
          sortOrderProvided: variantSortOrder !== undefined,
        });
      }

      let processedGroups = 0;
      const totalGroups = productGroups.size;

      for (const group of productGroups.values()) {
        processedGroups++;
        if (processedGroups % 5 === 0 || processedGroups === totalGroups) {
          const progress = Math.round((processedGroups / totalGroups) * 100);
          const processedItems = summary.imported + summary.updated + summary.duplicates + summary.skipped;
          const failedItems = summary.errors.length;
          // We don't await here to not block too much, or we can await. Awaiting is safer.
          await this.importJobService.updateProgress(job.id, progress, processedItems, failedItems, summary.totalRows);
        }
        if (!group.variants.length) {
          summary.skipped += group.rowNumbers.length;
          summary.errors.push({
            row: group.rowNumbers[0],
            message: 'No valid variants found for this product.',
          });
          continue;
        }

        const categoryIds = Array.from(group.categoryIds);
        const tags = Array.from(group.tags);
        const productImageUrls = Array.from(group.productImageUrls);

        const variantRecords = group.variants.map((entry, index) => {
          const clone = {
            ...entry.variant,
            sortOrder: entry.sortOrderProvided && Number.isFinite(entry.variant.sortOrder)
              ? Math.round(entry.variant.sortOrder)
              : index,
            variantItems: Array.isArray(entry.variant.variantItems)
              ? entry.variant.variantItems.map((item, itemIndex) => ({
                attributeId: item.attributeId,
                attributeValueId: item.attributeValueId,
                sortOrder: item.sortOrder !== undefined ? item.sortOrder : itemIndex,
              }))
              : [],
          };

          return {
            clone,
            sourceImageUrl: entry.sourceImageUrl,
            rowNumber: entry.rowNumber,
          };
        });

        const productPayload: any = {
          ...group.productData,
          ...(categoryIds.length > 0 ? { categoryIds } : {}),
          ...(tags.length > 0 ? { tags } : {}),
          variants: variantRecords.map((record) => record.clone),
        };

        const applyMediaUploads = async (payload: any) => {
          if (dryRun) {
            return;
          }

          let preparedMediaResult: { media: any[]; uploadMap: Map<string, ReuploadedImageResult> } | null = null;
          if (productImageUrls.length > 0) {
            preparedMediaResult = await this.prepareProductMediaUploads(productImageUrls, group.productData.name, params.actorId ?? null);
            payload.media = preparedMediaResult.media;
          }

          const variantImageUploadCache = new Map<string, ReuploadedImageResult>();
          for (const variantRecord of variantRecords) {
            if (!variantRecord.sourceImageUrl) {
              continue;
            }

            let upload = preparedMediaResult?.uploadMap.get(variantRecord.sourceImageUrl) ?? null;
            if (!upload) {
              if (variantImageUploadCache.has(variantRecord.sourceImageUrl)) {
                upload = variantImageUploadCache.get(variantRecord.sourceImageUrl)!;
              } else {
                upload = await this.reuploadRemoteImage(variantRecord.sourceImageUrl, {
                  userId: params.actorId ?? null,
                  folder: 'products',
                });
                variantImageUploadCache.set(variantRecord.sourceImageUrl, upload);
              }
            }

            variantRecord.clone.image = upload.uploadedUrl;
          }
        };

        try {
          let existingProduct: Product | null = null;
          if (group.productData.sku) {
            existingProduct = await this.productRepository.findBySku(group.productData.sku);
          }

          if (existingProduct) {
            if (!overrideExisting) {
              summary.duplicates += 1;
              summary.skipped += group.rowNumbers.length;
              summary.errors.push({
                row: group.rowNumbers[0],
                message: `Product with SKU ${group.productData.sku} already exists. Enable override to update existing records.`,
              });
              summary.details.push({
                row: group.rowNumbers[0],
                productName: group.productData.name,
                status: 'SKIPPED',
                message: `Product with SKU ${group.productData.sku} already exists. Enable override to update existing records.`,
              });
              continue;
            }

            if (dryRun) {
              summary.updated += group.rowNumbers.length;
              summary.updatedProductIds.push(existingProduct.id);
              summary.details.push({
                row: group.rowNumbers[0],
                productName: group.productData.name,
                status: 'UPDATED',
              });
              continue;
            }

            await applyMediaUploads(productPayload);

            const updatedProduct = await this.updateProduct(existingProduct.id, productPayload);
            summary.updated += group.rowNumbers.length;
            summary.updatedProductIds.push(updatedProduct.id);
            summary.details.push({
              row: group.rowNumbers[0],
              productName: group.productData.name,
              status: 'UPDATED',
            });
            continue;
          }

          if (dryRun) {
            summary.imported += group.rowNumbers.length;
            summary.details.push({
              row: group.rowNumbers[0],
              productName: group.productData.name,
              status: 'IMPORTED',
            });
            continue;
          }

          await applyMediaUploads(productPayload);

          const createdProduct = await this.createProduct(productPayload);
          summary.imported += group.rowNumbers.length;
          summary.createdProductIds.push(createdProduct.id);
          summary.details.push({
            row: group.rowNumbers[0],
            productName: group.productData.name,
            status: 'IMPORTED',
          });
        } catch (error: any) {
          const errorMessage = error?.error?.message || error?.message || 'Failed to process grouped rows';
          summary.skipped += group.rowNumbers.length;
          summary.errors.push({
            row: group.rowNumbers[0],
            message: errorMessage,
          });
          summary.details.push({
            row: group.rowNumbers[0],
            productName: group.productData.name,
            status: 'ERROR',
            message: errorMessage,
          });
        }
      }

      // 4. Process Translations Sheet
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
            productId: ['productid', 'product_id', 'masanpham', 'idsanpham', 'sku', 'id'],
            locale: ['locale', 'ngonngu', 'lang'],
            name: ['name', 'tensanpham', 'sanpham'],
            description: ['description', 'mota'],
            shortDescription: ['shortdescription', 'motangan'],
            slug: ['slug', 'duongdan'],
            metaTitle: ['metatitle', 'seotitle', 'tieudeseo'],
            metaDescription: ['metadescription', 'seodescription', 'motaseo'],
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
            const localeCode = normalizeString(value).toLowerCase();
            if (!localeCode) return null;
            if (localeCode.length < 2 || localeCode.length > 5) return null;
            return localeCode;
          };

          for (let index = 0; index < normalizedTranslationRows.length; index += 1) {
            const row = normalizedTranslationRows[index];
            const rowNumber = index + 1; // Start from 1 for consistency

            try {
              const productIdValue = normalizeString(getFromRow(row, translationColumnMap.productId));
              const localeValue = getFromRow(row, translationColumnMap.locale);
              const locale = parseLocale(localeValue);

              if (!productIdValue) {
                summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
                summary.errors.push({
                  row: rowNumber,
                  message: `Translations sheet: Missing Product Identifier (ID/SKU) at row ${rowNumber}.`,
                });
                continue;
              }

              if (!locale) {
                summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
                summary.errors.push({
                  row: rowNumber,
                  message: `Translations sheet: invalid Locale at row ${rowNumber}`,
                });
                continue;
              }

              // Robust lookup: ID/Variant ID -> SKU -> Name
              let product: Product | null = null;

              if (AdminProductService.UUID_REGEX.test(productIdValue)) {
                // Try as Product ID
                product = await this.productRepository.findById(productIdValue);

                // Fallback: Try as Variant ID
                if (!product) {
                  const variant = await this.productVariantRepository.findById(productIdValue);
                  if (variant && variant.productId) {
                    product = await this.productRepository.findById(variant.productId);
                  }
                }
              }

              if (!product) {
                // Try as SKU
                product = await this.productRepository.findBySku(productIdValue);
              }

              if (!product) {
                // Try as Name (as a last resort)
                const paginated = await this.productRepository.findAll({
                  filters: { search: productIdValue },
                  limit: 1,
                });
                if (paginated.items.length > 0 && paginated.items[0].name.toLowerCase() === productIdValue.toLowerCase()) {
                  product = paginated.items[0];
                }
              }

              if (!product) {
                summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
                summary.errors.push({
                  row: rowNumber,
                  message: `Translations sheet: product not found for identifier '${productIdValue}'. Please use a valid Product ID, Variant ID, SKU, or Name.`,
                });
                continue;
              }

              const productId = product.id;

              const translationPayload: any = {
                name: normalizeString(getFromRow(row, translationColumnMap.name)) || undefined,
                description: normalizeString(getFromRow(row, translationColumnMap.description)) || undefined,
                shortDescription: normalizeString(getFromRow(row, translationColumnMap.shortDescription)) || undefined,
                slug: normalizeString(getFromRow(row, translationColumnMap.slug)) || undefined,
                metaTitle: normalizeString(getFromRow(row, translationColumnMap.metaTitle)) || undefined,
                metaDescription: normalizeString(getFromRow(row, translationColumnMap.metaDescription)) || undefined,
                metaKeywords: normalizeString(getFromRow(row, translationColumnMap.metaKeywords)) || undefined,
              };

              const hasTranslationValues = Object.values(translationPayload).some(
                (value) => value !== undefined && value !== ''
              );
              if (!hasTranslationValues) {
                summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
                summary.errors.push({
                  row: rowNumber,
                  message: `Translations sheet: no translatable fields provided at row ${rowNumber}`,
                });
                continue;
              }

              const existingTranslation = await this.productRepository.findProductTranslation(
                productId,
                locale
              );

              if (existingTranslation) {
                if (!overrideExisting) {
                  summary.translationDuplicates = (summary.translationDuplicates ?? 0) + 1;
                  summary.translationSkipped = (summary.translationSkipped ?? 0) + 1;
                  summary.errors.push({
                    row: rowNumber,
                    message: `Translations sheet: translation already exists for ${productId} (${locale}). Enable override to update.`,
                  });
                  continue;
                }

                if (dryRun) {
                  summary.translationUpdated = (summary.translationUpdated ?? 0) + 1;
                  continue;
                }

                await this.productRepository.updateProductTranslation(productId, locale, translationPayload);
                summary.translationUpdated = (summary.translationUpdated ?? 0) + 1;
              } else {
                if (dryRun) {
                  summary.translationImported = (summary.translationImported ?? 0) + 1;
                  continue;
                }

                await this.productRepository.createProductTranslation({
                  product_id: productId,
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

      await this.importJobService.completeJob(job.id, summary);
    })().catch(async (error) => {
      await this.importJobService.failJob(job.id, error instanceof Error ? error.message : String(error));
    });

    return { jobId: job.id };
  }

  private async handleProductMedia(productId: string, mediaData: any[]): Promise<void> {
    try {
      // Delete existing media for this product
      await this.productMediaRepository.deleteByProductId(productId);

      // Create new media entries
      if (mediaData.length > 0) {
        const createMediaData: CreateProductMediaDto[] = mediaData.map((media, index) => ({
          productId,
          type: (media.type as MediaType) || MediaType.IMAGE,
          url: media.url,
          altText: media.altText || null,
          caption: media.caption || null,
          sortOrder: media.sortOrder !== undefined ? media.sortOrder : index,
          fileSize: media.fileSize || null,
          mimeType: media.mimeType || null,
          width: media.width || null,
          height: media.height || null,
          duration: media.duration || null,
          thumbnailUrl: media.thumbnailUrl || null,
          isPrimary: media.isPrimary || false,
        }));

        await this.productMediaRepository.createMany(createMediaData);
      }
    } catch (error) {
      throw new Error('Failed to update product media');
    }
  }

  private async prepareProductMediaUploads(
    imageUrls: string[],
    productName: string,
    userId: string | null,
  ): Promise<{ media: any[]; uploadMap: Map<string, ReuploadedImageResult> }> {
    const uploadMap = new Map<string, ReuploadedImageResult>();
    const media: any[] = [];

    for (let index = 0; index < imageUrls.length; index += 1) {
      const sourceUrl = imageUrls[index];
      const upload = await this.reuploadRemoteImage(sourceUrl, {
        userId,
        folder: 'products',
        alt: productName ? `${productName} image ${index + 1}` : undefined,
      });
      uploadMap.set(sourceUrl, upload);

      media.push({
        type: MediaType.IMAGE,
        url: upload.uploadedUrl,
        altText: productName ? `${productName} image ${index + 1}` : null,
        caption: null,
        sortOrder: index,
        fileSize: upload.size,
        mimeType: upload.mimeType,
        width: null,
        height: null,
        duration: null,
        thumbnailUrl: null,
        isPrimary: index === 0,
      });
    }

    return { media, uploadMap };
  }

  private async reuploadRemoteImage(
    imageUrl: string,
    options: { userId?: string | null; folder?: string; alt?: string; caption?: string; description?: string } = {},
  ): Promise<ReuploadedImageResult> {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is empty');
    }

    let response;
    try {
      response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      throw new BadRequestException(`Failed to download image from ${imageUrl}: ${message}`);
    }

    const contentTypeHeader = Array.isArray(response.headers['content-type'])
      ? response.headers['content-type'][0]
      : response.headers['content-type'];
    const mimeType = this.resolveMimeType(imageUrl, contentTypeHeader);

    const buffer = Buffer.from(response.data);

    const contentLengthHeader = Array.isArray(response.headers['content-length'])
      ? Number(response.headers['content-length'][0])
      : Number(response.headers['content-length']);
    const size = Number.isFinite(contentLengthHeader) && contentLengthHeader > 0
      ? contentLengthHeader
      : buffer.length;

    const originalName = this.deriveOriginalFilename(imageUrl, mimeType);

    const uploadedFile = {
      originalname: originalName,
      encoding: '7bit',
      mimetype: mimeType,
      buffer,
      size,
    };

    const uploadResult = await this.fileUploadService.uploadFile(uploadedFile as any, {
      folder: options.folder || 'products',
    });

    await this.mediaService.createMedia({
      originalName: uploadResult.originalName,
      filename: uploadResult.filename,
      url: uploadResult.url,
      mimeType,
      size,
      folder: options.folder || 'products',
      provider: uploadResult.provider,
      alt: options.alt,
      caption: options.caption,
      description: options.description,
    }, options.userId ?? null);

    return {
      sourceUrl: imageUrl,
      uploadedUrl: uploadResult.url,
      mimeType,
      size,
    };
  }

  private resolveMimeType(imageUrl: string, headerValue?: string): string {
    if (headerValue) {
      const normalizedHeader = headerValue.split(';')[0].trim().toLowerCase();
      if (normalizedHeader.startsWith('image/')) {
        return normalizedHeader;
      }
    }

    const extension = this.extractExtensionFromUrl(imageUrl);
    switch (extension) {
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.svg':
      case '.svgz':
        return 'image/svg+xml';
      case '.bmp':
        return 'image/bmp';
      case '.avif':
        return 'image/avif';
      case '.heic':
        return 'image/heic';
      case '.jpeg':
      case '.jpg':
      default:
        return 'image/jpeg';
    }
  }

  private extractExtensionFromUrl(imageUrl: string): string {
    try {
      const parsedUrl = new URL(imageUrl);
      const pathname = parsedUrl.pathname || '';
      const filename = pathname.split('/').pop() || '';
      return path.extname(filename).toLowerCase();
    } catch (error) {
      return '';
    }
  }

  private deriveOriginalFilename(imageUrl: string, mimeType: string): string {
    const fallbackExtension = this.extensionFromMimeType(mimeType);
    const fallbackName = `product-image.${fallbackExtension}`;

    try {
      const parsedUrl = new URL(imageUrl);
      const pathname = parsedUrl.pathname || '';
      const rawFilename = decodeURIComponent(pathname.split('/').pop() || '').trim();

      if (rawFilename) {
        const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        if (path.extname(safeFilename)) {
          return safeFilename;
        }
        return `${safeFilename}.${fallbackExtension}`;
      }
    } catch (error) {
      // Ignore URL parsing errors and fall back to generated name
    }

    return fallbackName;
  }

  private extensionFromMimeType(mimeType: string): string {
    const normalized = mimeType.toLowerCase();
    switch (normalized) {
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/gif':
        return 'gif';
      case 'image/svg+xml':
        return 'svg';
      case 'image/bmp':
        return 'bmp';
      case 'image/avif':
        return 'avif';
      case 'image/heic':
        return 'heic';
      case 'image/jpg':
      case 'image/jpeg':
      default:
        return 'jpg';
    }
  }

  private async handleProductVariants(productId: string, variantsData: any[]): Promise<void> {
    try {
      // Delete existing variants for this product first
      await this.productVariantRepository.deleteByProductId(productId);

      // Create new variants only if there are any
      if (variantsData && variantsData.length > 0) {
        for (const variantData of variantsData) {

          const createVariantData: CreateProductVariantDto = {
            productId,
            name: variantData.name || 'Default Variant',
            sku: variantData.sku || null,
            barcode: variantData.barcode || null,
            price: Number(variantData.price) || 0,
            compareAtPrice: variantData.compareAtPrice ? Number(variantData.compareAtPrice) : null,
            costPrice: variantData.costPrice ? Number(variantData.costPrice) : null,
            stockQuantity: Number(variantData.stockQuantity) || 0,
            lowStockThreshold: variantData.lowStockThreshold ? Number(variantData.lowStockThreshold) : null,
            trackInventory: Boolean(variantData.trackInventory),
            allowBackorders: Boolean(variantData.allowBackorders),
            weight: variantData.weight ? Number(variantData.weight) : null,
            dimensions: variantData.dimensions || null,
            image: variantData.image || null,
            isActive: Boolean(variantData.isActive),
            sortOrder: Number(variantData.sortOrder) || 0,
            variantItems: variantData.variantItems || [],
          };

          await this.productVariantRepository.create(createVariantData);
        }
      }
    } catch (error) {
      throw new Error('Failed to update product variants: ' + error.message);
    }
  }

  private async handleProductSpecifications(productId: string, specifications: any[]): Promise<void> {
    const normalized = specifications
      .filter((spec) => {
        const hasName = spec && typeof spec.name === 'string' && spec.name.trim() !== '';
        const hasValue = spec && spec.value !== undefined && spec.value !== null && String(spec.value).trim() !== '';
        return hasName && hasValue;
      })
      .map((spec, index): CreateProductSpecificationDto => {
        const parsedOrder = spec.sortOrder !== undefined ? Number(spec.sortOrder) : index;
        const sortOrder = Number.isFinite(parsedOrder) ? parsedOrder : index;
        const labelId = typeof spec.labelId === 'string' && spec.labelId ? spec.labelId : undefined;

        return {
          productId,
          name: String(spec.name).trim(),
          value: String(spec.value).trim(),
          sortOrder,
          labelId,
        };
      });

    if (normalized.length === 0) {
      await this.productSpecificationRepository.deleteByProductId(productId);
      return;
    }

    await this.productSpecificationRepository.replaceForProduct(productId, normalized);
  }

  private async handleProductCategories(productId: string, categoryIds: string[]): Promise<void> {
    try {
      // Update product categories using repository method
      await this.productRepository.updateProductCategories(productId, categoryIds);
    } catch (error) {
      throw new Error('Failed to update product categories: ' + error.message);
    }
  }

  private async handleWarehouseQuantities(
    productId: string,
    warehouseQuantities: Array<{ warehouseId: string; quantity: number }>,
  ): Promise<void> {
    try {
      await this.productWarehouseQuantityRepository.upsertWarehouseQuantities(
        productId,
        warehouseQuantities,
      );
    } catch (error) {
      throw new Error('Failed to update warehouse quantities: ' + error.message);
    }
  }



  async exportProducts(format: string, filters?: string | Record<string, any>, requestedBy?: string, exportMode: 'standard' | 'template' = 'standard') {
    const parsedFilters = this.parseFilters(filters);
    const sanitizedFilters = this.sanitizeExportFilters(parsedFilters);
    const resolvedFormat: ExportFormat = format === 'json' ? 'json' : 'csv';

    const resource = exportMode === 'template' ? 'product_import_template' : 'products';
    const columns = exportMode === 'template' ? PRODUCT_TEMPLATE_EXPORT_COLUMNS : PRODUCT_EXPORT_COLUMNS;

    const job = await this.dataExportService.requestExportJob({
      resource,
      format: resolvedFormat,
      filters: sanitizedFilters,
      columns,
      options: {
        pageSize: 500,
        fileName: exportMode === 'template' ? `product-import-template-${new Date().toISOString().split('T')[0]}` : undefined
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

  async estimateProductExport(filters?: string | Record<string, any>) {
    const parsedFilters = this.parseFilters(filters);
    const sanitizedFilters = this.sanitizeExportFilters(parsedFilters);
    const result = await this.productRepository.findAll({
      page: 1,
      limit: 1,
      filters: sanitizedFilters || {},
    });
    return { total: result.total };
  }

  async listProductExportJobs(limit = 10, requestedBy?: string, page = 1) {
    return this.dataExportService.listJobs(['products', 'product_import_template'], {
      limit,
      page,
      requestedBy,
    });
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

  private sanitizeExportFilters(filters?: Record<string, any>): ProductFilters | undefined {
    if (!filters) {
      return undefined;
    }

    const sanitized: ProductFilters = {};

    if (typeof filters.search === 'string' && filters.search.trim()) {
      sanitized.search = filters.search.trim();
    }

    if (typeof filters.brandId === 'string' && filters.brandId.trim()) {
      sanitized.brandId = filters.brandId.trim();
    }

    if (filters.categoryIds) {
      sanitized.categoryIds = this.parseCategoryIds(filters.categoryIds);
    }

    const status = this.parseStatusFilter(filters.status);
    if (status) {
      sanitized.status = status;
    }

    const isActive = this.parseBooleanFilter(filters.isActive);
    if (typeof isActive === 'boolean') {
      sanitized.isActive = isActive;
    }

    const isFeatured = this.parseBooleanFilter(filters.isFeatured);
    if (typeof isFeatured === 'boolean') {
      sanitized.isFeatured = isFeatured;
    }

    const hasStock = this.parseBooleanFilter(filters.hasStock);
    if (typeof hasStock === 'boolean') {
      sanitized.hasStock = hasStock;
    }

    const minPrice = this.parseNumberFilter(filters.minPrice);
    if (typeof minPrice === 'number') {
      sanitized.minPrice = minPrice;
    }

    const maxPrice = this.parseNumberFilter(filters.maxPrice);
    if (typeof maxPrice === 'number') {
      sanitized.maxPrice = maxPrice;
    }

    const createdFrom = this.parseDateFilter(filters.createdFrom);
    if (createdFrom) {
      sanitized.createdFrom = createdFrom;
    }

    const createdTo = this.parseDateFilter(filters.createdTo);
    if (createdTo) {
      sanitized.createdTo = createdTo;
    }

    return Object.keys(sanitized).length ? sanitized : undefined;
  }

  private parseBooleanFilter(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }

    return undefined;
  }

  private parseNumberFilter(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  private parseDateFilter(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString();
  }

  private parseStatusFilter(value: unknown): ProductStatus | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    return Object.values(ProductStatus).includes(value as ProductStatus)
      ? (value as ProductStatus)
      : undefined;
  }

  private parseCategoryIds(value: unknown): string[] | undefined {
    if (!value) {
      return undefined;
    }

    const rawArray = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
    const normalized = rawArray
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);

    return normalized.length ? Array.from(new Set(normalized)) : undefined;
  }

  async getProductPurchaseHistory(
    productId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    items: Array<{
      id: string;
      orderId: string;
      orderNumber: string;
      orderDate: Date;
      customerName: string;
      customerEmail: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      orderStatus: string;
      variantName?: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const normalizedProductId = await this.resolveProductId(productId);
    if (!normalizedProductId) {
      throw new NotFoundException('Product not found');
    }

    const dataSource = this.productRepository['manager'].connection;

    const skip = (page - 1) * limit;

    // Query order items with order information
    const queryBuilder = dataSource
      .getRepository('OrderItem')
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .where('orderItem.product_id = :productId', { productId: normalizedProductId })
      .orderBy('order.order_date', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    const formattedItems = items.map((item: Record<string, unknown>) => ({
      id: item['id'] as string,
      orderId: (item['order'] as Record<string, unknown>)?.['id'] as string,
      orderNumber: (item['order'] as Record<string, unknown>)?.['orderNumber'] as string,
      orderDate: (item['order'] as Record<string, unknown>)?.['orderDate'] as Date,
      customerName: (item['order'] as Record<string, unknown>)?.['customerName'] as string,
      customerEmail: (item['order'] as Record<string, unknown>)?.['customerEmail'] as string,
      quantity: item['quantity'] as number,
      unitPrice: Number(item['unitPrice']),
      totalPrice: Number(item['totalPrice']),
      orderStatus: (item['order'] as Record<string, unknown>)?.['status'] as string,
      variantName: item['variantName'] as string | undefined,
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
