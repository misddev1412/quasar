import { z } from 'zod';

/**
 * Standard API response schema for all tRPC endpoints
 * Provides consistent response structure across the application
 */
export const apiResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  data: z.any().optional(),
  errors: z.array(z.object({
    '@type': z.string(),
    reason: z.string(),
    domain: z.string(),
    metadata: z.record(z.string()).optional(),
  })).optional(),
  timestamp: z.string(),
});

/**
 * Paginated response schema for list endpoints
 */
export const paginatedResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  data: z.object({
    items: z.array(z.any()),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
  errors: z.array(z.object({
    '@type': z.string(),
    reason: z.string(),
    domain: z.string(),
    metadata: z.record(z.string()).optional(),
  })).optional(),
  timestamp: z.string(),
});

/**
 * Response schema for authentication endpoints
 */
export const authResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  data: z.object({
    user: z.any(),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number().optional(),
  }),
  errors: z.array(z.object({
    '@type': z.string(),
    reason: z.string(),
    domain: z.string(),
    metadata: z.record(z.string()).optional(),
  })).optional(),
  timestamp: z.string(),
});

/**
 * Response schema for endpoints that don't return data
 */
export const voidResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  errors: z.array(z.object({
    '@type': z.string(),
    reason: z.string(),
    domain: z.string(),
    metadata: z.record(z.string()).optional(),
  })).optional(),
  timestamp: z.string(),
});

/**
 * Type definitions for TypeScript
 */
export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & {
  data?: T;
};

export type PaginatedResponse<T = any> = z.infer<typeof paginatedResponseSchema> & {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AuthResponse<T = any> = z.infer<typeof authResponseSchema> & {
  data: {
    user: T;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  };
};

export type VoidResponse = z.infer<typeof voidResponseSchema>; 