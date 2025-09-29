import { z } from 'zod';
import { ProductStatus } from '@backend/modules/products/entities/product.entity';

// Product base schema
const productBaseSchema = z.object({
  name: z.string().min(1).max(255),
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

// Product variant schema
const productVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

// Product tag schema
const productTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
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
  productTagSchema,
  brandSchema,
  categorySchema,
  supplierSchema,
  warrantySchema,
  productSchema,
  productListQuerySchema,
  productListResponseSchema,
  productDetailResponseSchema,
};