import { z } from 'zod';

/**
 * Standard API response schema for all tRPC endpoints
 * Provides consistent response structure across the application
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  messageCode: z.string().optional(),
  errorCode: z.string().optional(),
  timestamp: z.date(),
});

/**
 * Paginated response schema for list endpoints
 */
export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(z.any()),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
  message: z.string().optional(),
  messageCode: z.string().optional(),
  errorCode: z.string().optional(),
  timestamp: z.date(),
});

/**
 * Response schema for authentication endpoints
 */
export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.any(),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number().optional(),
  }),
  message: z.string().optional(),
  messageCode: z.string().optional(),
  errorCode: z.string().optional(),
  timestamp: z.date(),
});

/**
 * Response schema for endpoints that don't return data
 */
export const voidResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  messageCode: z.string().optional(),
  errorCode: z.string().optional(),
  timestamp: z.date(),
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