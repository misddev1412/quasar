import { z } from 'zod';

export const ServiceTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
});

export const ServiceItemTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const ServiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  price: z.number().optional(),
  sortOrder: z.number().default(0),
  translations: z.array(ServiceItemTranslationSchema),
});

export const CreateServiceSchema = z.object({
  unitPrice: z.number().default(0),
  currencyId: z.string().uuid().optional().nullable(),
  isContactPrice: z.boolean().default(false),
  thumbnail: z.string().optional(),
  isActive: z.boolean().default(true),
  translations: z.array(ServiceTranslationSchema),
  items: z.array(ServiceItemSchema).optional(),
});

export const UpdateServiceSchema = CreateServiceSchema.partial();

export const ServiceFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceDto = z.infer<typeof UpdateServiceSchema>;
export type ServiceFilterDto = z.infer<typeof ServiceFilterSchema>;
