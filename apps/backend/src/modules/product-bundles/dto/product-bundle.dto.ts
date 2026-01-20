import { z } from 'zod';
import { BundleItemMode } from '../entities/product-bundle-item.entity';

export const productBundleItemSchema = z.object({
    label: z.string(),
    mode: z.nativeEnum(BundleItemMode),
    categoryIds: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
    position: z.number().optional(),
});

export const createProductBundleSchema = z.object({
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    items: z.array(productBundleItemSchema).optional(),
});

export const updateProductBundleSchema = createProductBundleSchema.partial();

export const productBundleListInputSchema = z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    search: z.string().optional(),
});

export const productBundleIdSchema = z.object({
    id: z.string(),
});

export const updateProductBundleInputSchema = z.object({
    id: z.string(),
    data: updateProductBundleSchema,
});

export type CreateProductBundleDto = z.infer<typeof createProductBundleSchema>;
export type UpdateProductBundleDto = z.infer<typeof updateProductBundleSchema>;
