import { z } from 'zod';
import { SectionType } from '@shared/enums/section.enums';

const jsonSchema: z.ZodType<Record<string, unknown>> = z.record(z.any());

export const sectionTranslationSchema = z.object({
  locale: z.string().min(2).max(10),
  title: z.string().max(255).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  configOverride: jsonSchema.optional().nullable(),
});

export type SectionTranslationDto = z.infer<typeof sectionTranslationSchema>;

export const createSectionSchema = z.object({
  page: z.string().min(1).max(100),
  type: z.nativeEnum(SectionType),
  position: z.number().int().min(0).optional(),
  isEnabled: z.boolean().optional(),
  config: jsonSchema.optional(),
  translations: z.array(sectionTranslationSchema).optional(),
});

export type CreateSectionDto = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = createSectionSchema.partial();
export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;

export const reorderSectionSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(0),
});

export const reorderSectionsSchema = z.object({
  page: z.string().min(1).max(100),
  sections: z.array(reorderSectionSchema).min(1),
});

export type ReorderSectionDto = z.infer<typeof reorderSectionSchema>;
export type ReorderSectionsDto = z.infer<typeof reorderSectionsSchema>;
