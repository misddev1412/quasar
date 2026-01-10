import { Injectable } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductMedia } from '../entities/product-media.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { Brand } from '../entities/brand.entity';
import { Category } from '../entities/category.entity';
import { ProductSpecification } from '../entities/product-specification.entity';

export interface TransformedProduct {
  id: string;
  name: string;
  slug: string | null;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  compareAtPrice: number | null;
  sortOrder: number;
  brandId: string | null;
  categoryIds: string[];
  warrantyId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  stockQuantity: number;
  enableWarehouseQuantity: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;

  // Related data
  brand: TransformedBrand | null;
  categories: TransformedCategory[];
  media: TransformedMedia[];
  variants: TransformedVariant[];
  specifications: TransformedSpecification[];
  warehouseQuantities: any[];

  // Computed properties
  primaryImage: string | null;
  imageUrls: string[];
  hasVariants: boolean;
  variantCount: number;
  totalStock: number;
  lowestPrice: number | null;
  highestPrice: number | null;
  priceRange: string | null;
  translations: TransformedProductTranslation[];
}

export interface TransformedProductTranslation {
  id: string;
  locale: string;
  name: string | null;
  description: string | null;
  shortDescription: string | null;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
}

export interface TransformedBrand {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  logo: string | null;
  isActive: boolean;
}

export interface TransformedCategory {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image: string | null;
  parentId: string | null;
  level: number;
  isActive: boolean;
}

export interface TransformedMedia {
  id: string;
  type: string;
  url: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  isPrimary: boolean;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnailUrl: string | null;
}

export interface TransformedVariantItem {
  id: string;
  attributeId: string;
  attributeValueId: string;
  sortOrder: number;
  attribute: {
    id: string;
    name: string;
    displayName: string | null;
    type: string;
  };
  attributeValue: {
    id: string;
    value: string;
    displayValue: string | null;
  };
}

export interface TransformedVariant {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number | null;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight: number | null;
  dimensions: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  variantItems: TransformedVariantItem[];
}

export interface TransformedSpecification {
  id: string;
  name: string;
  value: string;
  sortOrder: number;
  labelId: string | null;
  labelName: string | null;
  labelGroupName: string | null;
  labelGroupCode: string | null;
}

@Injectable()
export class ProductTransformer {

  /**
   * Transform a single product entity to frontend format
   */
  async transformProduct(product: Product): Promise<TransformedProduct> {
    // Fix TypeORM lazy loading serialization issues
    this.fixLazyLoadingSerialization(product);

    const media = this.extractAndTransformMedia(product);
    const variants = await this.extractAndTransformVariants(product);
    const brand = this.extractAndTransformBrand(product);
    const categories = this.extractAndTransformCategories(product);
    const specifications = this.extractAndTransformSpecifications(product);
    const translations = Array.isArray(product.translations)
      ? product.translations.map((translation) => ({
          id: translation.id,
          locale: translation.locale,
          name: translation.name || null,
          description: translation.description || null,
          shortDescription: translation.shortDescription || null,
          slug: translation.slug || null,
          metaTitle: translation.metaTitle || null,
          metaDescription: translation.metaDescription || null,
          metaKeywords: translation.metaKeywords || null,
        }))
      : [];

    // Calculate computed properties
    const imageUrls = media
      .filter(m => m.type === 'image')
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
      })
      .map(m => m.url);

    const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null;
    const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const hasVariants = variants.length > 0;
    const priceCandidates = hasVariants
      ? variants.map(v => v.price).filter(p => p > 0)
      : [Number(product.price) || 0].filter(p => p > 0);
    const lowestPrice = priceCandidates.length > 0 ? Math.min(...priceCandidates) : null;
    const highestPrice = priceCandidates.length > 0 ? Math.max(...priceCandidates) : null;
    const priceRange = this.calculatePriceRange(lowestPrice, highestPrice);
    const warehouseStock = product.warehouseQuantities?.reduce((sum, wq) => sum + (wq.quantity || 0), 0) || 0;
    const resolvedTotalStock = hasVariants
      ? totalStock
      : (product.enableWarehouseQuantity ? warehouseStock : (product.stockQuantity || 0));

    return {
      id: product.id,
      name: product.name,
      slug: product.slug || null,
      sku: product.sku || null,
      description: product.description || null,
      shortDescription: product.shortDescription || null,
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      price: Number(product.price) || 0,
      compareAtPrice: product.compareAtPrice !== undefined && product.compareAtPrice !== null
        ? Number(product.compareAtPrice)
        : null,
      sortOrder: product.sortOrder || 0,
      brandId: product.brandId || null,
      categoryIds: categories.map(c => c.id),
      warrantyId: product.warrantyId || null,
      metaTitle: product.metaTitle || null,
      metaDescription: product.metaDescription || null,
      metaKeywords: product.metaKeywords || null,
      stockQuantity: product.stockQuantity || 0,
      enableWarehouseQuantity: product.enableWarehouseQuantity || false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      createdBy: product.createdBy || null,

      // Related data
      brand,
      categories,
      media,
      variants,
      specifications,
      warehouseQuantities: product.warehouseQuantities || [],

      // Computed properties
      primaryImage,
      imageUrls,
      hasVariants: variants.length > 0,
      variantCount: variants.length,
      totalStock: resolvedTotalStock,
      lowestPrice,
      highestPrice,
      priceRange,
      translations,
    };
  }

  /**
   * Transform multiple products for list views
   */
  async transformProducts(products: Product[]): Promise<TransformedProduct[]> {
    const transformPromises = products.map(product => this.transformProduct(product));
    return await Promise.all(transformPromises);
  }

  /**
   * Transform a single variant to the frontend format
   */
  transformVariant(variant: ProductVariant): TransformedVariant {
    if (!variant) {
      throw new Error('Variant not provided');
    }

    const transformedVariants = this.processVariantsArray([variant]);
    if (transformedVariants.length === 0) {
      throw new Error('Unable to transform variant');
    }
    return transformedVariants[0];
  }

  /**
   * Transform multiple variants to the frontend format
   */
  transformVariants(variants: ProductVariant[]): TransformedVariant[] {
    if (!Array.isArray(variants)) {
      return [];
    }

    return this.processVariantsArray(variants);
  }

  /**
   * Transform product for minimal list view (lighter payload)
   */
  async transformProductMinimal(product: Product): Promise<Partial<TransformedProduct>> {
    this.fixLazyLoadingSerialization(product);

    const media = this.extractAndTransformMedia(product);
    const variants = await this.extractAndTransformVariants(product);
    const brand = this.extractAndTransformBrand(product);
    const categories = this.extractAndTransformCategories(product);

    const imageUrls = media
      .filter(m => m.type === 'image')
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
      })
      .map(m => m.url);

    const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null;
    const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const prices = variants.map(v => v.price).filter(p => p > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug || null,
      sku: product.sku || null,
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      brandId: product.brandId || null,
      categoryIds: categories.map(c => c.id),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      // Essential related data for list views
      brand: brand ? { id: brand.id, name: brand.name } as any : null,
      categories: categories.map(c => ({ id: c.id, name: c.name })) as any,

      // Essential computed properties
      primaryImage,
      hasVariants: variants.length > 0,
      variantCount: variants.length,
      totalStock,
      lowestPrice,
      highestPrice,
      priceRange: this.calculatePriceRange(lowestPrice, highestPrice),
    };
  }

  /**
   * Fix TypeORM lazy loading serialization issues
   */
  private fixLazyLoadingSerialization(product: Product): void {
    const relations = ['media', 'variants', 'brand', 'productCategories', 'tags', 'specifications', 'translations'];

    relations.forEach(relation => {
      const underscoreKey = `__${relation}__`;
      if (underscoreKey in product && !(product as any)[relation]) {
        (product as any)[relation] = (product as any)[underscoreKey];
        delete (product as any)[underscoreKey];
      }
    });
  }

  /**
   * Extract and transform media relations
   */
  private extractAndTransformMedia(product: Product): TransformedMedia[] {
    const media = (product as any).media;
    const normalized = this.unwrapRelationArray(media);
    return normalized.length ? this.processMediaArray(normalized) : [];
  }

  private extractAndTransformSpecifications(product: Product): TransformedSpecification[] {
    const specifications = (product as any).specifications as ProductSpecification[] | Promise<ProductSpecification[]> | undefined;

    if (!specifications) {
      return [];
    }

    const toArray = (data: ProductSpecification[] | Promise<ProductSpecification[]>): ProductSpecification[] => {
      if (Array.isArray(data)) {
        return data;
      }

      if (typeof (data as any)[Symbol.iterator] === 'function') {
        return Array.from(data as any);
      }

      console.warn('Specifications relation resolved as non-array Promise. Returning empty array.');
      return [];
    };

    const resolved = toArray(specifications);

    return resolved
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((spec) => ({
        id: spec.id,
        name: spec.name,
        value: spec.value,
        sortOrder: spec.sortOrder ?? 0,
        labelId: spec.labelId ?? null,
        labelName: spec.label ? spec.label.label : null,
        labelGroupName: spec.label ? spec.label.groupName : null,
        labelGroupCode: spec.label ? spec.label.groupCode ?? null : null,
      }));
  }

  /**
   * Process media array and transform to TransformedMedia[]
   */
  private processMediaArray(mediaArray: any[]): TransformedMedia[] {
    return mediaArray
      .sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      })
      .map((m: any): TransformedMedia => ({
        id: m.id,
        type: m.type,
        url: m.url,
        altText: m.altText || null,
        caption: m.caption || null,
        sortOrder: m.sortOrder || 0,
        isPrimary: m.isPrimary || false,
        fileSize: m.fileSize || null,
        mimeType: m.mimeType || null,
        width: m.width || null,
        height: m.height || null,
        duration: m.duration || null,
        thumbnailUrl: m.thumbnailUrl || null,
      }));
  }

  /**
   * Extract and transform variant relations
   */
  private async extractAndTransformVariants(product: Product): Promise<TransformedVariant[]> {
    const variants = (product as any).variants;

    if (!variants) {
      return [];
    }

    if (Array.isArray(variants)) {
      return this.processVariantsArray(variants);
    }

    if (variants instanceof Promise) {
      try {
        const resolved = await variants;
        if (Array.isArray(resolved)) {
          return this.processVariantsArray(resolved);
        }
      } catch (awaitError) {
        console.error('Error awaiting variants Promise:', awaitError.message);
      }

      const normalizedPromiseData = this.unwrapRelationArray(variants);
      return normalizedPromiseData.length ? this.processVariantsArray(normalizedPromiseData) : [];
    }

    if (typeof variants === 'object') {
      const normalized = this.unwrapRelationArray(variants);
      return normalized.length ? this.processVariantsArray(normalized) : [];
    }

    return [];
  }

  /**
   * Process variants array and transform to TransformedVariant[]
   */
  private processVariantsArray(variantsArray: any[]): TransformedVariant[] {
    return variantsArray
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((v: any): TransformedVariant => {
        // Transform variant items if they exist
        const variantItems = this.extractAndTransformVariantItems(v.variantItems || []);

        return {
          id: v.id,
          name: v.name,
          sku: v.sku || null,
          barcode: v.barcode || null,
          price: v.price || 0,
          compareAtPrice: v.compareAtPrice || null,
          costPrice: v.costPrice || null,
          stockQuantity: v.stockQuantity || 0,
          lowStockThreshold: v.lowStockThreshold || null,
          trackInventory: v.trackInventory || false,
          allowBackorders: v.allowBackorders || false,
          weight: v.weight || null,
          dimensions: v.dimensions || null,
          image: v.image || null,
          isActive: v.isActive !== false,
          sortOrder: v.sortOrder || 0,
          variantItems,
        };
      });
  }

  /**
   * Extract and transform variant items
   */
  private extractAndTransformVariantItems(variantItems: any[]): TransformedVariantItem[] {
    if (!Array.isArray(variantItems)) {
      return [];
    }

    return variantItems
      .filter(item => item && item.id) // Filter out invalid items
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item: any): TransformedVariantItem => ({
        id: item.id,
        attributeId: item.attributeId,
        attributeValueId: item.attributeValueId,
        sortOrder: item.sortOrder || 0,
        attribute: {
          id: item.attribute?.id || item.attributeId,
          name: item.attribute?.name || 'Unknown',
          displayName: item.attribute?.displayName || null,
          type: item.attribute?.type || 'TEXT',
        },
        attributeValue: {
          id: item.attributeValue?.id || item.attributeValueId,
          value: item.attributeValue?.value || 'Unknown',
          displayValue: item.attributeValue?.displayValue || null,
        },
      }));
  }

  /**
   * Extract and transform brand relation
   */
  private extractAndTransformBrand(product: Product): TransformedBrand | null {
    const brand = (product as any).brand;

    // Check if brand is a Promise (lazy loaded but not resolved)
    if (brand instanceof Promise) {
      return null;
    }

    // Handle loaded lazy relation that might still be wrapped
    let brandData = brand;
    if (brandData && typeof brandData === 'object' && !brandData.id) {
      if (brandData.value && brandData.value.id) {
        brandData = brandData.value;
      } else if (brandData.__value__ && brandData.__value__.id) {
        brandData = brandData.__value__;
      }
    }

    if (!brandData || !brandData.id) {
      return null;
    }

    return {
      id: brandData.id,
      name: brandData.name,
      slug: brandData.slug || null,
      description: brandData.description || null,
      logo: brandData.logo || null,
      isActive: brandData.isActive !== false,
    };
  }

  /**
   * Extract and transform categories relation through ProductCategory junction
   */
  private extractAndTransformCategories(product: Product): TransformedCategory[] {
    const productCategories = (product as any).productCategories;

    // Check if productCategories is a Promise (lazy loaded but not resolved)
    if (productCategories instanceof Promise) {
      return [];
    }

    // Handle case where productCategories is already an array
    if (Array.isArray(productCategories)) {
      const categories = productCategories
        .map(pc => pc.category)
        .filter(category => category && category.id);
      return this.processCategoriesArray(categories);
    }

    // Handle case where productCategories is loaded but still wrapped in another object
    let productCategoriesArray = productCategories;
    if (!Array.isArray(productCategories) && productCategories && typeof productCategories === 'object') {
      // Try array-like object with length property
      if (typeof productCategories.length === 'number' && productCategories.length >= 0) {
        productCategoriesArray = Array.from(productCategories);
      }
      // Try nested value properties
      else if (productCategories.value && Array.isArray(productCategories.value)) {
        productCategoriesArray = productCategories.value;
      }
      else if (productCategories.__value__ && Array.isArray(productCategories.__value__)) {
        productCategoriesArray = productCategories.__value__;
      }
      // Try extracting from numeric keys
      else {
        const keys = Object.keys(productCategories);
        const numericKeys = keys.filter(k => !isNaN(Number(k)) && Number(k) >= 0);
        if (numericKeys.length > 0) {
          productCategoriesArray = numericKeys
            .map(k => productCategories[k])
            .filter(item => item && typeof item === 'object' && item.category);
        }
      }
    }

    if (!productCategoriesArray || !Array.isArray(productCategoriesArray)) {
      return [];
    }

    const categories = productCategoriesArray
      .map(pc => pc.category)
      .filter(category => category && category.id);
    return this.processCategoriesArray(categories);
  }

  /**
   * Process categories array and transform to TransformedCategory[]
   */
  private processCategoriesArray(categoriesArray: any[]): TransformedCategory[] {
    return categoriesArray
      .filter(c => c && c.id) // Filter out invalid categories
      .map((c: any): TransformedCategory => ({
        id: c.id,
        name: c.name,
        slug: c.slug || null,
        description: c.description || null,
        image: c.image || null,
        parentId: c.parentId || null,
        level: c.level || 0,
        isActive: c.isActive !== false,
      }));
  }

  /**
   * Calculate price range string
   */
  private calculatePriceRange(lowestPrice: number | null, highestPrice: number | null): string | null {
    if (lowestPrice === null || highestPrice === null) {
      return null;
    }

    if (lowestPrice === highestPrice) {
      return `$${lowestPrice.toFixed(2)}`;
    }

    return `$${lowestPrice.toFixed(2)} - $${highestPrice.toFixed(2)}`;
  }

  /**
   * Normalize relation data into an array when it may be wrapped inside promises or array-like structures.
   */
  private unwrapRelationArray(source: any): any[] {
    if (!source) {
      return [];
    }

    if (Array.isArray(source)) {
      return source;
    }

    const nestedCandidates = [source.value, source.__value__];
    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    if (typeof source === 'object') {
      const numericValues = Object.keys(source)
        .filter(key => !isNaN(Number(key)) && Number(key) >= 0)
        .map(key => source[key])
        .filter(item => item && typeof item === 'object');

      if (numericValues.length > 0) {
        return numericValues;
      }
    }

    if (typeof source.length === 'number' && source.length >= 0) {
      try {
        return Array.from(source);
      } catch {
        return [];
      }
    }

    return [];
  }
}
