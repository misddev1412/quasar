import { z } from 'zod';
import { MediaType } from '../entities/media.entity';

// Create Media DTO
export const createMediaSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  folder: z.string().default('media'),
  maxSize: z.number().optional(),
});

export type CreateMediaDto = z.infer<typeof createMediaSchema>;

// Update Media DTO
export const updateMediaSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateMediaDto = z.infer<typeof updateMediaSchema>;

// Media List Query DTO
export const mediaListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.nativeEnum(MediaType).optional(),
  folder: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'originalName', 'size']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type MediaListQueryDto = z.infer<typeof mediaListQuerySchema>;

// Delete Multiple Media DTO
export const deleteMultipleMediaSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type DeleteMultipleMediaDto = z.infer<typeof deleteMultipleMediaSchema>;

// Media Upload Response DTO
export const mediaUploadResponseSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  originalName: z.string(),
  url: z.string().url(),
  mimeType: z.string(),
  type: z.nativeEnum(MediaType),
  size: z.number(),
  folder: z.string(),
  provider: z.string(),
  alt: z.string().nullable(),
  caption: z.string().nullable(),
  description: z.string().nullable(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaUploadResponseDto = z.infer<typeof mediaUploadResponseSchema>;

// Media List Response DTO
export const mediaListResponseSchema = z.object({
  media: z.array(mediaUploadResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type MediaListResponseDto = z.infer<typeof mediaListResponseSchema>;

// Media Stats Response DTO
export const mediaStatsResponseSchema = z.object({
  totalFiles: z.number(),
  totalSize: z.number(),
  sizeFormatted: z.string(),
  byType: z.record(z.nativeEnum(MediaType), z.number()),
  byFolder: z.record(z.string(), z.number()),
});

export type MediaStatsResponseDto = z.infer<typeof mediaStatsResponseSchema>;