export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  category?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  // Additional properties for the detailed product structure
  sku?: string;
  status?: string;
  brandId?: string;
  supplierId?: string;
  warrantyId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive?: boolean;
  isContactPrice?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  brand?: Record<string, unknown>;
  supplier?: Record<string, unknown>;
  warranty?: Record<string, unknown>;
  tags?: unknown[];
  variants?: ProductVariant[];
  media?: ProductMedia[];
  categories?: unknown[];
  specifications?: ProductSpecification[];
  totalStock?: number;
  lowestPrice?: number | null;
  highestPrice?: number | null;
  priceRange?: string | null;
  currencyCode?: string;
  hasVariants?: boolean;
  variantCount?: number;
  viewCount?: number;
  translations?: ProductTranslation[];
}

export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  sortOrder?: number;
  labelId?: string | null;
  labelName?: string | null;
  labelGroupName?: string | null;
  labelGroupCode?: string | null;
}

export interface Attribute {
  id: string;
  name: string;
  displayName?: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  displayValue?: string;
}

export interface ProductVariantItem {
  id: string;
  productVariantId: string;
  attributeId: string;
  attributeValueId: string;
  sortOrder: number;
  attribute?: Attribute;
  attributeValue?: AttributeValue;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: string;
  image?: string;
  attributes?: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
  variantItems?: ProductVariantItem[];
}

export interface ProductTranslation {
  id: string;
  locale: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  type: string;
  altText?: string;
  isPrimary: boolean;
  isImage: boolean;
  sortOrder: number;
}

export interface ProductFilters {
  categories: Array<{ id: string; name: string; count: number }>;
  brands: Array<{ id: string; name: string; count: number }>;
  priceRange: { min: number; max: number };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
  children?: Category[];
  parent?: Category;
  productCount?: number;
  translations?: CategoryTranslation[];
}

export interface CategoryTranslation {
  id: string;
  categoryId: string;
  locale: string;
  name?: string;
  description?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
}

export interface CategoryTree {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  level: number;
  sortOrder: number;
  productCount?: number;
  children: CategoryTree[];
}
