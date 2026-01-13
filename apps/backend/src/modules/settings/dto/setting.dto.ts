import { z } from 'zod';

export const settingTypes = ['string', 'number', 'boolean', 'json', 'array'] as const;

export const createSettingSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string().optional(),
  type: z.enum(settingTypes).default('string'),
  group: z.string().max(100).optional(),
  isPublic: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

export const updateSettingSchema = z.object({
  id: z.string().uuid(),
  value: z.string().optional(),
  type: z.enum(settingTypes).optional(),
  group: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

export const bulkUpdateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1).max(255),
    value: z.string().optional(),
    group: z.string().max(100).optional(),
    isPublic: z.boolean().optional(),
  }))
});

export const getSettingByKeySchema = z.object({
  key: z.string().min(1).max(255),
});

export const getSettingsByGroupSchema = z.object({
  group: z.string().min(1).max(100),
});

export const settingResponseSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.string().nullable(),
  type: z.enum(settingTypes),
  group: z.string().nullable(),
  isPublic: z.boolean(),
  description: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type CreateSettingDto = z.infer<typeof createSettingSchema>;
export type UpdateSettingDto = z.infer<typeof updateSettingSchema>;
export type BulkUpdateSettingsDto = z.infer<typeof bulkUpdateSettingsSchema>;
export type SettingResponseDto = z.infer<typeof settingResponseSchema>; 