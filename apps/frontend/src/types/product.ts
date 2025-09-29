export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
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
  isFeatured?: boolean;
  sortOrder?: number;
  brand?: Record<string, unknown>;
  supplier?: Record<string, unknown>;
  warranty?: Record<string, unknown>;
  tags?: unknown[];
  variants?: ProductVariant[];
  media?: ProductMedia[];
  categories?: unknown[];
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