import { PaginatedResponse, ErrorDetails } from './common.types';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * HTTP status codes
 */
export enum HttpStatusCode {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Client Error
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Error
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

/**
 * Base API response structure
 */
export interface BaseApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ErrorDetails[];
  timestamp: string;
  requestId?: string;
}

/**
 * Success API response
 */
export interface SuccessApiResponse<T = any> extends BaseApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Error API response
 */
export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  errors: ErrorDetails[];
  data?: never;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = any> extends SuccessApiResponse<PaginatedResponse<T>> {
  data: PaginatedResponse<T>;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse<T = any> {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}

/**
 * API request headers
 */
export interface ApiHeaders {
  'Content-Type'?: string;
  Authorization?: string;
  'Accept-Language'?: string;
  'User-Agent'?: string;
  'X-Request-ID'?: string;
  'X-Client-Version'?: string;
  [key: string]: string | undefined;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  url: string;
  method: HttpMethod;
  headers?: ApiHeaders;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: ApiHeaders;
  retries?: number;
  retryDelay?: number;
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

/**
 * API versioning information
 */
export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  sunset?: Date;
  supportedUntil?: Date;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: Record<string, {
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }>;
}

/**
 * Generic list/search request parameters
 */
export interface ListRequestParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Generic create request
 */
export interface CreateRequest<T = any> {
  data: T;
  options?: {
    skipValidation?: boolean;
    skipHooks?: boolean;
    upsert?: boolean;
  };
}

/**
 * Generic update request
 */
export interface UpdateRequest<T = any> {
  id: string;
  data: Partial<T>;
  options?: {
    skipValidation?: boolean;
    skipHooks?: boolean;
    merge?: boolean;
  };
}

/**
 * Generic delete request
 */
export interface DeleteRequest {
  id: string;
  options?: {
    soft?: boolean;
    skipHooks?: boolean;
    cascade?: boolean;
  };
}

/**
 * Batch request wrapper
 */
export interface BatchRequest<T = any> {
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    data: T;
    id?: string;
  }>;
  options?: {
    atomic?: boolean;
    skipValidation?: boolean;
    continueOnError?: boolean;
  };
} 