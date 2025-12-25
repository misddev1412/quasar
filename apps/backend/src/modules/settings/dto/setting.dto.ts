import { z } from 'zod';

// 支持的设置类型
export const settingTypes = ['string', 'number', 'boolean', 'json', 'array'] as const;

// 创建设置 DTO
export const createSettingSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string().optional(),
  type: z.enum(settingTypes).default('string'),
  group: z.string().max(100).optional(),
  isPublic: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

// 更新设置 DTO
export const updateSettingSchema = z.object({
  id: z.string().uuid(),
  value: z.string().optional(),
  type: z.enum(settingTypes).optional(),
  group: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

// 批量更新设置 DTO
export const bulkUpdateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1).max(255),
    value: z.string().optional(),
    group: z.string().max(100).optional(),
    isPublic: z.boolean().optional(),
  }))
});

// 获取设置 DTO
export const getSettingByKeySchema = z.object({
  key: z.string().min(1).max(255),
});

export const getSettingsByGroupSchema = z.object({
  group: z.string().min(1).max(100),
});

// 设置响应 Schema
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

// 导出类型
export type CreateSettingDto = z.infer<typeof createSettingSchema>;
export type UpdateSettingDto = z.infer<typeof updateSettingSchema>;
export type BulkUpdateSettingsDto = z.infer<typeof bulkUpdateSettingsSchema>;
export type SettingResponseDto = z.infer<typeof settingResponseSchema>; 