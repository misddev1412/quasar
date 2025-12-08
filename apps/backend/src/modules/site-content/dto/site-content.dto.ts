import { z } from 'zod';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

const metadataSchema: z.ZodType<Record<string, unknown>> = z.record(z.any());

export const listSiteContentQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().min(1).max(255).optional(),
  category: z.nativeEnum(SiteContentCategory).optional(),
  status: z.nativeEnum(SiteContentStatus).optional(),
  languageCode: z.string().min(2).max(10).optional(),
  isFeatured: z.boolean().optional(),
  fromPublishedAt: z.coerce.date().optional(),
  toPublishedAt: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'displayOrder']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type ListSiteContentQueryDto = z.infer<typeof listSiteContentQuerySchema>;

export const createSiteContentSchema = z.object({
  code: z.string().min(2).max(100),
  title: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  category: z.nativeEnum(SiteContentCategory).default(SiteContentCategory.INFORMATION),
  status: z.nativeEnum(SiteContentStatus).default(SiteContentStatus.DRAFT),
  summary: z.string().max(4000).optional().nullable(),
  content: z.string().optional().nullable(),
  languageCode: z.string().min(2).max(10).default('vi'),
  publishedAt: z.coerce.date().optional().nullable(),
  metadata: metadataSchema.optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isFeatured: z.boolean().optional(),
});

export type CreateSiteContentDto = z.infer<typeof createSiteContentSchema>;

export const updateSiteContentSchema = createSiteContentSchema.partial();
export type UpdateSiteContentDto = z.infer<typeof updateSiteContentSchema>;

export const siteContentIdSchema = z.object({ id: z.string().uuid() });
export type SiteContentIdDto = z.infer<typeof siteContentIdSchema>;

export const bulkDeleteSiteContentSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
export type BulkDeleteSiteContentDto = z.infer<typeof bulkDeleteSiteContentSchema>;
