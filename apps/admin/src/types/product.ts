export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  products?: Product[];
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  image?: string;
  isActive: boolean;
  sortOrder: number;
  level: number;
  products?: Product[];
  productsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attribute {
  id: string;
  name: string;
  displayName?: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'COLOR' | 'DATE';
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  values?: AttributeValue[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributeValue {
  id: string;
  attributeId: string;
  attribute?: Attribute;
  value: string;
  displayValue?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductTag {
  id: string;
  name: string;
  slug?: string;
  color?: string;
  description?: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMedia {
  id: string;
  productId: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warranty {
  id: string;
  name: string;
  description?: string;
  durationMonths: number;
  type: 'MANUFACTURER' | 'EXTENDED' | 'STORE';
  terms?: string;
  isActive: boolean;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  brandId?: string;
  brand?: Brand | string;
  categoryId?: string;
  category?: Category | string;
  warrantyId?: string;
  warranty?: Warranty;
  images?: string[];
  media?: ProductMedia[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  tags?: ProductTag[] | string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  price?: number;
  stockQuantity?: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantItem {
  id: string;
  productVariantId: string;
  attributeId: string;
  attributeValueId: string;
  sortOrder: number;
  attribute?: Attribute;
  attributeValue?: AttributeValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  product?: Product;
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
  images?: string[];
  attributes?: Record<string, any>;
  isActive: boolean;
  sortOrder: number;
  variantItems?: ProductVariantItem[];
  inventoryTransactions?: InventoryTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  product?: Product;
  attributeId: string;
  attribute?: Attribute;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  productId?: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  transactionType: 'PURCHASE' | 'SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'RETURN' | 'DAMAGE';
  referenceId?: string;
  reason?: string;
  performerId: string;
  performer?: any; // User type from user module
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  purchaseOrders?: PurchaseOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  totalAmount?: number;
  notes?: string;
  items?: PurchaseOrderItem[];
  createdBy: string;
  creator?: any; // User type
  approvedBy?: string;
  approver?: any; // User type
  approvedAt?: Date;
  receivedBy?: string;
  receiver?: any; // User type
  receivedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  productId?: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface CreateBrandFormData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
}

export interface CreateCategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
}

export interface CreateProductFormData {
  name: string;
  description?: string;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  brandId?: string;
  categoryId?: string;
  warrantyId?: string;
  images?: string[];
  media?: ProductMedia[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isFeatured: boolean;
}

export interface CreateSupplierFormData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
}

// API Response types
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface BrandsResponse {
  brands: Brand[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ProductStatsResponse {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  discontinuedProducts: number;
  lowStockProducts: number;
  totalVariants: number;
}