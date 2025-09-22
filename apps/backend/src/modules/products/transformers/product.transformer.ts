import { Injectable } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductMedia } from '../entities/product-media.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { Brand } from '../entities/brand.entity';
import { Category } from '../entities/category.entity';

export interface TransformedProduct {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  brandId: string | null;
  categoryIds: string[];
  warrantyId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Related data
  brand: TransformedBrand | null;
  categories: TransformedCategory[];
  media: TransformedMedia[];
  variants: TransformedVariant[];

  // Computed properties
  primaryImage: string | null;
  imageUrls: string[];
  hasVariants: boolean;
  variantCount: number;
  totalStock: number;
  lowestPrice: number | null;
  highestPrice: number | null;
  priceRange: string | null;
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

@Injectable()
export class ProductTransformer {

  /**
   * Transform a single product entity to frontend format
   */
  async transformProduct(product: Product): Promise<TransformedProduct> {
    // console.log('🚀 [ProductTransformer] transformProduct called for:', product.id);

    // Fix TypeORM lazy loading serialization issues
    this.fixLazyLoadingSerialization(product);

    const media = this.extractAndTransformMedia(product);
    const variants = await this.extractAndTransformVariants(product);
    const brand = this.extractAndTransformBrand(product);
    const categories = this.extractAndTransformCategories(product);

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
    const prices = variants.map(v => v.price).filter(p => p > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : null;
    const priceRange = this.calculatePriceRange(lowestPrice, highestPrice);

    return {
      id: product.id,
      name: product.name,
      sku: product.sku || null,
      description: product.description || null,
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder || 0,
      brandId: product.brandId || null,
      categoryIds: categories.map(c => c.id),
      warrantyId: product.warrantyId || null,
      metaTitle: product.metaTitle || null,
      metaDescription: product.metaDescription || null,
      metaKeywords: product.metaKeywords || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      // Related data
      brand,
      categories,
      media,
      variants,

      // Computed properties
      primaryImage,
      imageUrls,
      hasVariants: variants.length > 0,
      variantCount: variants.length,
      totalStock,
      lowestPrice,
      highestPrice,
      priceRange,
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
    const relations = ['media', 'variants', 'brand', 'productCategories', 'tags'];

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

    // DEBUG: Log media to see what we're getting
    console.log('🔍 DEBUG MEDIA - Product ID:', product.id);
    console.log('🔍 DEBUG MEDIA - Raw media:', media);
    console.log('🔍 DEBUG MEDIA - Media type:', typeof media);
    console.log('🔍 DEBUG MEDIA - Is Promise?', media instanceof Promise);
    console.log('🔍 DEBUG MEDIA - Is Array?', Array.isArray(media));

    // Handle regular array case (most common with leftJoinAndSelect)
    if (Array.isArray(media)) {
      console.log('🔍 DEBUG MEDIA - Processing array directly');
      return this.processMediaArray(media);
    }

    // Handle case where media is a Promise but has resolved data (from leftJoinAndSelect)
    if (media instanceof Promise) {
      // When using leftJoinAndSelect, TypeORM often stores the resolved data directly in the Promise object
      // Try to extract the resolved data from various Promise internal structures

      // Debug: Log all properties and descriptors of the Promise
      try {
        console.log('🔍 DEBUG MEDIA - Promise prototype:', Object.getPrototypeOf(media));
        console.log('🔍 DEBUG MEDIA - Promise constructor:', media.constructor.name);

        const allKeys = Object.getOwnPropertyNames(media);
        console.log('🔍 DEBUG MEDIA - All Promise property names:', allKeys);

        const descriptors = Object.getOwnPropertyDescriptors(media);
        console.log('🔍 DEBUG MEDIA - Promise descriptors:', Object.keys(descriptors));

        // Try to access specific internal properties that might exist
        const internalProps = ['[[PromiseState]]', '[[PromiseValue]]', '__value__', '_value', 'value', '__fulfilled__', '__result__'];
        internalProps.forEach(prop => {
          if (prop in media) {
            console.log(`🔍 DEBUG MEDIA - Found property ${prop}:`, (media as any)[prop]);
          }
        });

        // Check for Symbol properties
        const symbols = Object.getOwnPropertySymbols(media);
        console.log('🔍 DEBUG MEDIA - Promise symbols:', symbols.map(s => s.toString()));

        // Try to iterate over the Promise if it's iterable
        if (Symbol.iterator in media) {
          console.log('🔍 DEBUG MEDIA - Promise is iterable');
          try {
            const iterator = (media as any)[Symbol.iterator]();
            const iterResult = iterator.next();
            console.log('🔍 DEBUG MEDIA - Iterator result:', iterResult);
          } catch (iterError) {
            console.log('🔍 DEBUG MEDIA - Iterator error:', iterError.message);
          }
        }
      } catch (debugError) {
        console.log('🔍 DEBUG MEDIA - Debug error:', debugError.message);
      }

      // Check if the Promise has resolved data stored in internal properties
      if ((media as any).__value__ && Array.isArray((media as any).__value__)) {
        console.log('🔍 DEBUG MEDIA - Found resolved data in Promise.__value__');
        return this.processMediaArray((media as any).__value__);
      }

      // Check for other TypeORM internal storage patterns
      if ((media as any).value && Array.isArray((media as any).value)) {
        console.log('🔍 DEBUG MEDIA - Found resolved data in Promise.value');
        return this.processMediaArray((media as any).value);
      }

      // For leftJoinAndSelect queries, the Promise might have numeric keys containing the actual data
      try {
        const keys = Object.keys(media);
        console.log('🔍 DEBUG MEDIA - Promise keys:', keys);

        // Check if it's an array-like object with numeric keys (common with leftJoinAndSelect)
        const numericKeys = keys.filter(k => !isNaN(Number(k)) && Number(k) >= 0);
        if (numericKeys.length > 0) {
          console.log('🔍 DEBUG MEDIA - Converting Promise with numeric keys to array');
          const mediaArray = numericKeys
            .map(k => (media as any)[k])
            .filter(item => item && typeof item === 'object' && item.id);
          return this.processMediaArray(mediaArray);
        }
      } catch (error) {
        console.log('🔍 DEBUG MEDIA - Error accessing Promise data:', error.message);
      }

      // Try accessing the Promise directly as it might be resolved synchronously
      try {
        // Check if we can access length property
        if (typeof (media as any).length === 'number') {
          console.log('🔍 DEBUG MEDIA - Promise has length property:', (media as any).length);
          const mediaArray = Array.from(media as any);
          return this.processMediaArray(mediaArray);
        }
      } catch (error) {
        console.log('🔍 DEBUG MEDIA - Cannot access Promise as array-like:', error.message);
      }

      console.log('🔍 DEBUG MEDIA - Returning empty array (unresolved Promise)');
      return [];
    }

    // Handle case where media is loaded but still wrapped in another object
    let mediaArray = media;
    if (!Array.isArray(media) && media && typeof media === 'object') {
      console.log('🔍 DEBUG MEDIA - Trying to unwrap object');

      // Try array-like object with length property
      if (typeof media.length === 'number' && media.length >= 0) {
        console.log('🔍 DEBUG MEDIA - Using Array.from on object with length');
        mediaArray = Array.from(media);
      }
      // Try nested value properties
      else if (media.value && Array.isArray(media.value)) {
        console.log('🔍 DEBUG MEDIA - Using media.value');
        mediaArray = media.value;
      }
      else if (media.__value__ && Array.isArray(media.__value__)) {
        console.log('🔍 DEBUG MEDIA - Using media.__value__');
        mediaArray = media.__value__;
      }
      // Try extracting from numeric keys
      else {
        const keys = Object.keys(media);
        const numericKeys = keys.filter(k => !isNaN(Number(k)) && Number(k) >= 0);
        if (numericKeys.length > 0) {
          console.log('🔍 DEBUG MEDIA - Extracting from numeric keys');
          mediaArray = numericKeys
            .map(k => media[k])
            .filter(item => item && typeof item === 'object' && item.id);
        }
      }
    }

    if (!mediaArray || !Array.isArray(mediaArray)) {
      console.log('🔍 DEBUG MEDIA - Returning empty array (not array)');
      return [];
    }

    return this.processMediaArray(mediaArray);
  }

  /**
   * Process media array and transform to TransformedMedia[]
   */
  private processMediaArray(mediaArray: any[]): TransformedMedia[] {
    console.log('🔍 DEBUG MEDIA - Processing', mediaArray.length, 'media items');

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

    // DEBUG: Log variants to see what we're getting (commented out for production)
    // console.log('🔍 DEBUG VARIANTS - Product ID:', product.id);
    // console.log('🔍 DEBUG VARIANTS - Raw variants:', variants);
    // console.log('🔍 DEBUG VARIANTS - Variants type:', typeof variants);
    // console.log('🔍 DEBUG VARIANTS - Is Promise?', variants instanceof Promise);
    // console.log('🔍 DEBUG VARIANTS - Is Array?', Array.isArray(variants));

    // Check if variants is a Promise (lazy loaded but not resolved)
    if (variants instanceof Promise) {
      // console.log('🔍 DEBUG VARIANTS - Promise detected, attempting to await it');
      try {
        const resolvedVariants = await variants;
        // console.log('🔍 DEBUG VARIANTS - Successfully resolved Promise:', resolvedVariants);
        if (Array.isArray(resolvedVariants)) {
          return this.processVariantsArray(resolvedVariants);
        }
      } catch (awaitError) {
        console.error('Error awaiting variants Promise:', awaitError.message);
      }
      // For leftJoinAndSelect queries, the Promise might have numeric keys containing the actual data
      try {
        const keys = Object.keys(variants);
        console.log('🔍 DEBUG VARIANTS - Promise keys:', keys);

        // Try to access the resolved data directly from the Promise
        // Check for numeric keys (array-like structure)
        const numericKeys = keys.filter(k => !isNaN(Number(k)) && Number(k) >= 0);
        if (numericKeys.length > 0) {
          console.log('🔍 DEBUG VARIANTS - Converting Promise with numeric keys to array');
          const variantsArray = numericKeys
            .map(k => (variants as any)[k])
            .filter(item => item && typeof item === 'object' && item.id);
          console.log('🔍 DEBUG VARIANTS - Extracted variants from Promise:', variantsArray);
          return this.processVariantsArray(variantsArray);
        }

        // Try to access the Promise data directly by checking if it looks like an array
        console.log('🔍 DEBUG VARIANTS - Trying to stringify Promise to see structure');
        try {
          const promiseString = JSON.stringify(variants, null, 2);
          console.log('🔍 DEBUG VARIANTS - Promise stringified:', promiseString);
        } catch (stringifyError) {
          console.log('🔍 DEBUG VARIANTS - Cannot stringify Promise:', stringifyError.message);
        }

        // Try accessing index [0] directly since we can see it's an array in the logs
        console.log('🔍 DEBUG VARIANTS - Trying direct array access');
        try {
          console.log('🔍 DEBUG VARIANTS - Checking variants[0]:', (variants as any)[0]);
          console.log('🔍 DEBUG VARIANTS - Type of variants[0]:', typeof (variants as any)[0]);

          if ((variants as any)[0] && typeof (variants as any)[0] === 'object') {
            console.log('🔍 DEBUG VARIANTS - Found data at index 0:', (variants as any)[0]);
            // Try to collect all numeric indices
            const extractedVariants = [];
            for (let i = 0; i < 10; i++) { // Try up to 10 variants
              if ((variants as any)[i] && typeof (variants as any)[i] === 'object' && (variants as any)[i].id) {
                extractedVariants.push((variants as any)[i]);
              } else {
                break; // Stop when we don't find more variants
              }
            }
            if (extractedVariants.length > 0) {
              console.log('🔍 DEBUG VARIANTS - Extracted variants by direct access:', extractedVariants);
              return this.processVariantsArray(extractedVariants);
            }
          }

          // Try to use Object.getOwnPropertyDescriptors to see all properties
          console.log('🔍 DEBUG VARIANTS - Trying property descriptors');
          const descriptors = Object.getOwnPropertyDescriptors(variants);
          console.log('🔍 DEBUG VARIANTS - Property descriptors:', Object.keys(descriptors));

          // Try to access using Reflect
          console.log('🔍 DEBUG VARIANTS - Trying Reflect.ownKeys');
          const ownKeys = Reflect.ownKeys(variants);
          console.log('🔍 DEBUG VARIANTS - Own keys:', ownKeys);

        } catch (directAccessError) {
          console.log('🔍 DEBUG VARIANTS - Direct access error:', directAccessError.message);
        }

        // Try to check if the Promise has a length property (like an array)
        if (typeof (variants as any).length === 'number' && (variants as any).length > 0) {
          console.log('🔍 DEBUG VARIANTS - Promise has length property:', (variants as any).length);
          try {
            const variantsArray = Array.from(variants as any);
            console.log('🔍 DEBUG VARIANTS - Converted Promise to array:', variantsArray);
            return this.processVariantsArray(variantsArray);
          } catch (arrayError) {
            console.log('🔍 DEBUG VARIANTS - Error converting Promise to array:', arrayError.message);
          }
        }

        // Try to access resolved data from internal properties
        const internalProps = ['__value__', '_value', 'value', '__fulfilled__', '__result__'];
        for (const prop of internalProps) {
          if (prop in variants && Array.isArray((variants as any)[prop])) {
            console.log(`🔍 DEBUG VARIANTS - Found array in Promise.${prop}`);
            return this.processVariantsArray((variants as any)[prop]);
          }
        }

        // Check if we can iterate over the Promise
        if (Symbol.iterator in variants) {
          console.log('🔍 DEBUG VARIANTS - Promise is iterable');
          try {
            const variantsArray = Array.from(variants as any);
            console.log('🔍 DEBUG VARIANTS - Converted iterable Promise to array:', variantsArray);
            return this.processVariantsArray(variantsArray);
          } catch (iterError) {
            console.log('🔍 DEBUG VARIANTS - Iterator error:', iterError.message);
          }
        }

      } catch (error) {
        console.log('🔍 DEBUG VARIANTS - Error accessing Promise data:', error.message);
      }

      console.log('🔍 DEBUG VARIANTS - Returning empty array (unresolved Promise)');
      return [];
    }

    // Handle case where variants is loaded but still wrapped
    let variantsArray = variants;

    // If variants is not an array but has loaded data, try to extract it
    if (!Array.isArray(variants) && variants && typeof variants === 'object') {
      if (variants.length !== undefined) {
        variantsArray = Array.from(variants);
      } else if (variants.value && Array.isArray(variants.value)) {
        variantsArray = variants.value;
      } else if (variants.__value__ && Array.isArray(variants.__value__)) {
        variantsArray = variants.__value__;
      }
    }

    if (!variantsArray || !Array.isArray(variantsArray)) {
      return [];
    }

    return this.processVariantsArray(variantsArray);
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
}