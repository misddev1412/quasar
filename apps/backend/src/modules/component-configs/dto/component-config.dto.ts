import { z } from 'zod';
import { ComponentStructureType, ComponentCategory } from '@shared/enums/component.enums';

const jsonSchema: z.ZodType<Record<string, unknown>> = z.record(z.unknown());

export const createComponentConfigSchema = z.object({
  componentKey: z.string().min(1).max(150),
  displayName: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  componentType: z.nativeEnum(ComponentStructureType),
  category: z.nativeEnum(ComponentCategory),
  position: z.number().int().min(0).optional(),
  isEnabled: z.boolean().optional(),
  defaultConfig: jsonSchema.optional(),
  configSchema: jsonSchema.optional(),
  metadata: jsonSchema.optional(),
  allowedChildKeys: z.array(z.string().min(1)).optional(),
  previewMediaUrl: z.string().url().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  slotKey: z.string().max(100).optional().nullable(),
  sectionIds: z.array(z.string().uuid()).optional(),
});

export type CreateComponentConfigDto = z.infer<typeof createComponentConfigSchema>;

export const updateComponentConfigSchema = createComponentConfigSchema.partial();
export type UpdateComponentConfigDto = z.infer<typeof updateComponentConfigSchema>;

export const listComponentConfigSchema = z.object({
  parentId: z.string().uuid().optional().nullable(),
  category: z.nativeEnum(ComponentCategory).optional(),
  componentType: z.nativeEnum(ComponentStructureType).optional(),
  onlyEnabled: z.boolean().optional(),
  includeChildren: z.boolean().optional(),
  sectionId: z.string().uuid().optional().nullable(),
});

export type ListComponentConfigDto = z.infer<typeof listComponentConfigSchema>;
