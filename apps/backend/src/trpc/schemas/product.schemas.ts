import { z } from 'zod';
import { ProductStatus } from '@backend/modules/products/entities/product.entity';

// Product base schema
const productBaseSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).nullable().optional(),
  description: z.string().optional(),
  sku: z.string().max(100).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  brandId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  warrantyId: z.string().uuid().optional(),
  images: z.string().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  viewCount: z.number().int().min(0).optional(),
  soldCount: z.number().int().min(0).optional(),
  averageRating: z.number().min(0).max(5).nullable().optional(),
  reviewCount: z.number().int().min(0).nullable().optional(),
});

// Product media schema
const productMediaSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  type: z.string(),
  altText: z.string().optional(),
  isPrimary: z.boolean(),
  isImage: z.boolean(),
  sortOrder: z.number().int(),
});

const productVariantItemSchema = z.object({
  id: z.string(),
  attributeId: z.string().nullable().optional(),
  attributeValueId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  attribute: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string().nullable().optional(),
    type: z.string().optional(),
  }).optional(),
  attributeValue: z.object({
    id: z.string(),
    value: z.string(),
    displayValue: z.string().nullable().optional(),
  }).optional(),
});

// Product variant schema
const productVariantSchema = z.object({
  id: z.string(),
  sku: z.string().nullable().optional(),
  name: z.string(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  costPrice: z.number().nonnegative().nullable().optional(),
  stockQuantity: z.number().int().min(0),
  weight: z.number().nonnegative().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int().nullable().optional(),
  trackInventory: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  attributes: z.record(z.string().nullable()).optional(),
  variantItems: z.array(productVariantItemSchema).optional(),
});

// Product tag schema
const productTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
});

const productSpecificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  sortOrder: z.number().int().optional(),
});

// Brand schema
const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().url().optional(),
  description: z.string().optional(),
});

// Category schema
const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// Supplier schema
const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Warranty schema
const warrantySchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number().int().positive(),
  description: z.string().optional(),
});

// Complete product schema
const productSchema = productBaseSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  brand: brandSchema.optional(),
  supplier: supplierSchema.optional(),
  warranty: warrantySchema.optional(),
  tags: z.array(productTagSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  media: z.array(productMediaSchema).optional(),
  categories: z.array(categorySchema).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
});

// Product list query schema
const productListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'sortOrder']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

// Product list response schema
const productListResponseSchema = z.object({
  products: z.array(productSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().positive(),
    totalPages: z.number().int().positive(),
  }),
});

// Product detail response schema
const productDetailResponseSchema = z.object({
  product: productSchema,
});

// Export all schemas
export {
  productBaseSchema,
  productMediaSchema,
  productVariantSchema,
  productVariantItemSchema,
  productTagSchema,
  productSpecificationSchema,
  brandSchema,
  categorySchema,
  supplierSchema,
  warrantySchema,
  productSchema,
  productListQuerySchema,
  productListResponseSchema,
  productDetailResponseSchema,
};
