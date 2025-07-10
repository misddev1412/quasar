import { z } from 'zod';

// Create SEO DTO
export const createSeoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  keywords: z.string().max(255).optional(),
  path: z.string().min(1).max(255),
  isActive: z.boolean().default(true),
  additionalMetaTags: z.record(z.string()).optional(),
});

export type CreateSeoDto = z.infer<typeof createSeoSchema>;

// Update SEO DTO
export const updateSeoSchema = createSeoSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateSeoDto = z.infer<typeof updateSeoSchema>;

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