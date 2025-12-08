import { z } from 'zod';

const SeoBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(500).optional().nullable(),
  keywords: z.string().max(255).optional().nullable(),
  path: z.string().min(1, 'Path is required').max(255),
  group: z.string().max(255).optional().default('general'),
  active: z.boolean().default(true),
  additionalMetaTags: z.record(z.string()).optional().nullable(),
});

export const CreateSeoDto = SeoBaseSchema;
export type CreateSeoDto = z.infer<typeof CreateSeoDto>;

export const UpdateSeoDto = SeoBaseSchema.partial();
export type UpdateSeoDto = z.infer<typeof UpdateSeoDto>;

export const SeoDtoSchema = SeoBaseSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
export type SeoDto = z.infer<typeof SeoDtoSchema>;

// Get SEO By Path DTO
export const getSeoByPathSchema = z.object({
  path: z.string().min(1),
});

export type GetSeoByPathDto = z.infer<typeof getSeoByPathSchema>;

// SEO Response DTO
export const seoResponseSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  keywords: z.string().nullish(),
  additionalMetaTags: z.record(z.string()).nullish(),
});

export type SeoResponseDto = z.infer<typeof seoResponseSchema>; 