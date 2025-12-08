/**
 * Error Code Structure
 * Represents the components of a structured error code
 */
export interface ErrorCodeStructure {
  moduleCode: number;  // ModuleCode enum value
  operationCode: number;  // OperationCode enum value
  errorLevelCode: number;  // ErrorLevelCode enum value
  fullCode: string;
}

/**
 * Structured Error Response
 * Standard error response format for the application
 */
export interface StructuredErrorResponse {
  success: false;
  error: {
    code: string;                   // 6-digit error code (XXYYZZ)
    message: string;                // Human-readable error message
    details?: string;               // Additional error details
    field?: string;                 // Field that caused the error (for validation)
    timestamp: Date;                // When the error occurred
    requestId?: string;             // Request tracking ID
    module: string;                 // Module name from enum
    operation: string;              // Operation name from enum
    level: string;                  // Error level name from enum
  };
}

/**
 * Success Response
 * Standard success response format for the application
 */
export interface StructuredSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;               // Optional success message
  code?: string;                  // Optional success code
  timestamp: Date;                // When the response was generated
  requestId?: string;             // Request tracking ID
  meta?: {                        // Optional metadata
    module?: string;
    operation?: string;
    level?: string;
    requestId?: string;
  };
}

/**
 * Structured API Response Union Type
 * Represents either success or error response
 */
export type StructuredApiResponse<T = any> = StructuredSuccessResponse<T> | StructuredErrorResponse;

/**
 * Error Code Registry Entry
 * Defines the structure for error code registry
 */
export interface ErrorCodeRegistryEntry {
  code: string;
  module: number;  // ModuleCode enum value
  operation: number;  // OperationCode enum value
  level: number;  // ErrorLevelCode enum value
  httpStatus: number;
  message: string;
  description?: string;
  examples?: string[];
}

/**
 * Error Code Registry
 * Registry type for all error codes in the system
 */
export type ErrorCodeRegistry = Record<string, ErrorCodeRegistryEntry>;

/**
 * Error Handler Options
 * Configuration options for error handling
 */
export interface ErrorHandlerOptions {
  includeStackTrace?: boolean;
  logToConsole?: boolean;
  logToFile?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  notifyExternal?: boolean;
  requestId?: string;
}

/**
 * Error Context
 * Additional context information for error handling
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  body?: any;
  params?: any;
  query?: any;
  headers?: Record<string, string>;
}

/**
 * Message Context
 * Additional context information for message handling
 */
export interface MessageContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  body?: any;
  params?: any;
  query?: any;
  headers?: Record<string, string>;
}

/**
 * Validation Error Detail
 * Detailed information about validation errors
 */
export interface ValidationErrorDetail {
  field: string;
  value: any;
  message: string;
  code: string;
  constraints?: string[];
}

/**
 * Structured Validation Error Response
 * Extended error response for validation errors
 */
export interface StructuredValidationErrorResponse extends Omit<StructuredErrorResponse, 'error'> {
  error: StructuredErrorResponse['error'] & {
    validationErrors: ValidationErrorDetail[];
  };
}

/**
 * Error Metrics
 * Structure for error tracking and metrics
 */
export interface ErrorMetrics {
  code: string;
  count: number;
  lastOccurrence: Date;
  avgResponseTime?: number;
  affectedUsers?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Error Notification
 * Structure for error notifications to external services
 */
export interface ErrorNotification {
  errorCode: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context: ErrorContext;
  affectedUsers?: number;
  estimatedImpact?: string;
}

/**
 * Module Error Configuration
 * Configuration for error handling per module
 */
export interface ModuleErrorConfig {
  moduleCode: number;  // ModuleCode enum value
  moduleName: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  notificationThreshold: number;
  retryAttempts: number;
  circuitBreakerEnabled: boolean;
  rateLimitEnabled: boolean;
} 