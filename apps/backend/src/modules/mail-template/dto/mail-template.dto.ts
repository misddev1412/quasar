import { IsString, IsBoolean, IsOptional, IsArray, MaxLength, MinLength } from 'class-validator';
import { z } from 'zod';

// Class-validator DTOs for NestJS
export class CreateMailTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  type: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  recipientType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientRoles?: string[];

  @IsOptional()
  @IsString()
  emailChannelId?: string;
}

export class UpdateMailTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  body?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  type?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  recipientType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientRoles?: string[];

  @IsOptional()
  @IsString()
  emailChannelId?: string;
}

export class MailTemplateResponseDto {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
  description?: string;
  variables?: string[];
  fromEmail?: string;
  fromName?: string;
  recipientType?: string;
  recipientRoles?: string[];
  emailChannelId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export class MailTemplateListItemDto {
  id: string;
  name: string;
  subject: string;
  type: string;
  isActive: boolean;
  description?: string;
  variableCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProcessTemplateDto {
  @IsString()
  templateId: string;

  @IsOptional()
  variables?: Record<string, any>;
}

export class ProcessedTemplateResponseDto {
  subject: string;
  body: string;
  originalTemplate: {
    id: string;
    name: string;
    type: string;
  };
  processedVariables: Record<string, any>;
  missingVariables: string[];
}

// Zod schemas for tRPC validation
export const createMailTemplateSchema = z.object({
  name: z.string().min(2).max(255),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  type: z.string().min(1).max(100),
  isActive: z.boolean().optional().default(true),
  description: z.string().max(1000).optional(),
  variables: z.array(z.string()).optional(),
  fromEmail: z.string().email().max(255).optional(),
  fromName: z.string().max(255).optional(),
  recipientType: z.enum(['manual', 'roles', 'all_users']).optional().default('manual'),
  recipientRoles: z.array(z.string()).optional(),
  emailChannelId: z.string().optional(),
});

export const updateMailTemplateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
  type: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  variables: z.array(z.string()).optional(),
  fromEmail: z.string().email().max(255).optional(),
  fromName: z.string().max(255).optional(),
  recipientType: z.enum(['manual', 'roles', 'all_users']).optional(),
  recipientRoles: z.array(z.string()).optional(),
  emailChannelId: z.string().optional(),
});

export const mailTemplateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
  type: z.string(),
  isActive: z.boolean(),
  description: z.string().optional(),
  variables: z.array(z.string()).optional(),
  fromEmail: z.string().optional(),
  fromName: z.string().optional(),
  recipientType: z.string().optional(),
  recipientRoles: z.array(z.string()).optional(),
  emailChannelId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  version: z.number(),
});

export const mailTemplateListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  type: z.string(),
  isActive: z.boolean(),
  description: z.string().optional(),
  variableCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getMailTemplatesQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'type', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

// Make the interface match the schema defaults
export interface MailTemplateFilters {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  sortBy: 'name' | 'type' | 'createdAt' | 'updatedAt';
  sortOrder: 'ASC' | 'DESC';
}

export const processTemplateSchema = z.object({
  templateId: z.string().uuid(),
  variables: z.record(z.any()).optional(),
});

export const processedTemplateResponseSchema = z.object({
  subject: z.string(),
  body: z.string(),
  originalTemplate: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
  }),
  processedVariables: z.record(z.any()),
  missingVariables: z.array(z.string()),
});

export const cloneTemplateSchema = z.object({
  templateId: z.string().uuid(),
  newName: z.string().min(2).max(255),
});

// Filter and search types - moved above

// Template types enum for better type safety
export enum MailTemplateType {
  USER_ONBOARDING = 'user_onboarding',
  AUTHENTICATION = 'authentication',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  SYSTEM = 'system',
  TRANSACTIONAL = 'transactional',
  REMINDER = 'reminder',
  WELCOME = 'welcome',
  CONFIRMATION = 'confirmation',
  ALERT = 'alert',
}

export const mailTemplateTypeSchema = z.nativeEnum(MailTemplateType);

// Type definitions for TypeScript
export type CreateMailTemplateInput = z.infer<typeof createMailTemplateSchema>;
export type UpdateMailTemplateInput = z.infer<typeof updateMailTemplateSchema>;
export type MailTemplateResponse = z.infer<typeof mailTemplateResponseSchema>;
export type MailTemplateListItem = z.infer<typeof mailTemplateListItemSchema>;
export type GetMailTemplatesQuery = z.infer<typeof getMailTemplatesQuerySchema>;
export type ProcessTemplateInput = z.infer<typeof processTemplateSchema>;
export type ProcessedTemplateResponse = z.infer<typeof processedTemplateResponseSchema>;
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>;
