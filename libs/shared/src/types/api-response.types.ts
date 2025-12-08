/**
 * API Design Guide compliant response interfaces
 * Based on industry standards and best practices
 */

/**
 * API Error Info structure
 * Provides machine-readable error identification
 */
export interface ApiErrorInfo {
  '@type': string;
  reason: string; // UPPER_SNAKE_CASE error reason
  domain: string; // Service domain (e.g., 'user.quasar.com')
  metadata?: Record<string, string>; // Additional context
}

/**
 * API Localized Message structure
 * For user-facing error messages
 */
export interface ApiLocalizedMessage {
  '@type': string;
  locale: string; // IETF BCP-47 language tag (e.g., 'en-US')
  message: string; // Localized error message
}

/**
 * API Bad Request structure
 * For field-specific validation errors
 */
export interface ApiBadRequest {
  '@type': string;
  fieldViolations: Array<{
    field: string; // Field path (e.g., 'user.email')
    description: string; // Description of the violation
  }>;
}

/**
 * API precondition failure
 * For business logic constraint violations
 */
export interface ApiPreconditionFailure {
  '@type': string;
  violations: Array<{
    type: string; // Type of violation
    subject: string; // Subject that failed
    description: string; // Human-readable description
  }>;
}

/**
 * Standard API status codes
 */
export enum ApiStatusCodes {
  // Success codes
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // Client error codes
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // Server error codes
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Standard API error reasons
 */
export enum ApiErrorReasons {
  // Authentication & Authorization
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  INVALID_REQUEST = 'INVALID_REQUEST',
  FIELD_VALIDATION_FAILED = 'FIELD_VALIDATION_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  INVALID_STATE = 'INVALID_STATE',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE',
}

/**
 * API status for RPC-style responses
 */
export interface ApiStatus {
  code: number; // Status code
  message: string; // Error message
  details?: Array<ApiErrorInfo | ApiLocalizedMessage | ApiBadRequest | ApiPreconditionFailure>;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: {
    code: number; // HTTP status code
    message: string; // Error message
    status: string; // HTTP status text
    details?: Array<ApiErrorInfo | ApiLocalizedMessage | ApiBadRequest | ApiPreconditionFailure>;
  };
}

/**
 * Standard API success response for single resources
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

/**
 * Standard API success response for collections/lists
 */
export interface ApiListResponse<T = any> {
  data: T[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPageToken?: string;
    previousPageToken?: string;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

/**
 * Standard API success response for operations
 */
export interface ApiOperationResponse {
  success: boolean;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
    operationId?: string;
  };
}

/**
 * Standardized tRPC response format
 */
export interface TrpcApiResponse<T = any> {
  code: number;
  status: string;
  data?: T;
  errors?: Array<ApiErrorInfo | ApiLocalizedMessage | ApiBadRequest | ApiPreconditionFailure>;
  timestamp: string;
}

// Import existing types for compatibility
export type {
  ErrorContext,
  ErrorHandlerOptions
} from './error-codes.types';

export type {
  ModuleCode,
  OperationCode,
  ErrorLevelCode
} from '../enums/error-codes.enums'; 