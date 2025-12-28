import { z } from 'zod';
import { PostStatus, PostType } from '../entities/post.entity';

// Base post translation schema
export const PostTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).refine((val) => {
    // Allow Unicode characters but forbid certain special characters
    return val.length > 0 && 
           !val.startsWith('-') && 
           !val.endsWith('-') && 
           !/-{2,}/.test(val) && 
           !/[*+~.()'"!:@#$%^&<>{}[\]\\|`=]/.test(val);
  }, 'Slug must not start/end with hyphens or contain forbidden characters'),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  metaKeywords: z.string().optional(),
});

// Create post schema
export const CreatePostSchema = z.object({
  status: z.nativeEnum(PostStatus).optional().default(PostStatus.DRAFT),
  type: z.nativeEnum(PostType).optional().default(PostType.POST),
  featuredImage: z.string().url().optional(),
  authorId: z.string().uuid(),
  publishedAt: z.coerce.date().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  allowComments: z.boolean().optional().default(true),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  metaKeywords: z.string().optional(),
  translations: z.array(PostTranslationSchema).min(1),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

// Update post schema
export const UpdatePostSchema = z.object({
  status: z.nativeEnum(PostStatus).optional(),
  type: z.nativeEnum(PostType).optional(),
  featuredImage: z.string().url().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
  isFeatured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  metaKeywords: z.string().optional(),
  translations: z.array(PostTranslationSchema).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

// Post filters schema
export const PostFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  type: z.nativeEnum(PostType).optional(),
  authorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  locale: z.string().min(2).max(5).optional(),
  isFeatured: z.boolean().optional(),
});

// Post category schemas
export const CreatePostCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).refine((val) => {
    // Allow Unicode characters but forbid certain special characters
    return val.length > 0 && 
           !val.startsWith('-') && 
           !val.endsWith('-') && 
           !/-{2,}/.test(val) && 
           !/[*+~.()'"!:@#$%^&<>{}[\]\\|`=]/.test(val);
  }, 'Slug must not start/end with hyphens or contain forbidden characters'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const UpdatePostCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// Post tag schemas
export const CreatePostTagSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).refine((val) => {
    // Allow Unicode characters but forbid certain special characters
    return val.length > 0 && 
           !val.startsWith('-') && 
           !val.endsWith('-') && 
           !/-{2,}/.test(val) && 
           !/[*+~.()'"!:@#$%^&<>{}[\]\\|`=]/.test(val);
  }, 'Slug must not start/end with hyphens or contain forbidden characters'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  isActive: z.boolean().default(true),
});

export const UpdatePostTagSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  isActive: z.boolean().optional(),
});

// Common schemas
export const IdSchema = z.object({
  id: z.string().uuid(),
});

export const SlugSchema = z.object({
  slug: z.string().min(1),
});

// Type exports
export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
export type PostFiltersDto = z.infer<typeof PostFiltersSchema>;
export type CreatePostCategoryDto = z.infer<typeof CreatePostCategorySchema>;
export type UpdatePostCategoryDto = z.infer<typeof UpdatePostCategorySchema>;
export type CreatePostTagDto = z.infer<typeof CreatePostTagSchema>;
export type UpdatePostTagDto = z.infer<typeof UpdatePostTagSchema>;
export type PostTranslationDto = z.infer<typeof PostTranslationSchema>;
