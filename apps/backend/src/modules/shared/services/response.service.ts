import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { 
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiListResponse,
  ApiErrorInfo,
  ApiLocalizedMessage,
  ApiBadRequest,
  ApiErrorReasons,
  ApiStatusCodes,
  ModuleCode,
  OperationCode
} from '@shared';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { MessageLevelCode } from '@shared/enums/message-codes.enums';

/**
 * Response Service
 * Simple service to handle API success and error responses
 */
@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);
  private readonly domain = 'quasar.com';

  // ================================================================
  // SUCCESS RESPONSE METHODS
  // ================================================================

  /**
   * Create success response for single resource
   */
  createSuccess<T>(
    data: T,
    options?: {
      requestId?: string;
      version?: string;
    }
  ): ApiSuccessResponse<T> {
    return {
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: options?.requestId,
        version: options?.version || '1.0'
      }
    };
  }

  /**
   * Create success response for collections with pagination
   */
  createList<T>(
    data: T[],
    pagination?: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPageToken?: string;
      previousPageToken?: string;
    },
    options?: {
      requestId?: string;
      version?: string;
    }
  ): ApiListResponse<T> {
    return {
      data,
      pagination,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: options?.requestId,
        version: options?.version || '1.0'
      }
    };
  }

  // ================================================================
  // ERROR RESPONSE METHODS
  // ================================================================

  /**
   * Create error response
   */
  createError(
    code: number,
    message: string,
    status: string,
    details?: Array<ApiErrorInfo | ApiLocalizedMessage | ApiBadRequest>,
    options?: { requestId?: string }
  ): ApiErrorResponse {
    this.logger.error(`API Error [${code}]: ${message}`, {
      code,
      status,
      details,
      requestId: options?.requestId
    });

    return {
      error: {
        code,
        message,
        status,
        details
      }
    };
  }

  /**
   * Create validation error response
   */
  createValidationError(
    fieldErrors: Array<{ field: string; message: string }>,
    options?: { requestId?: string }
  ): ApiErrorResponse {
    const badRequest: ApiBadRequest = {
      '@type': 'type.googleapis.com/google.rpc.BadRequest',
      fieldViolations: fieldErrors.map(({ field, message }) => ({
        field,
        description: message
      }))
    };

    return this.createError(
      ApiStatusCodes.BAD_REQUEST,
      'Validation failed',
      'BAD_REQUEST',
      [badRequest],
      options
    );
  }

  // ================================================================
  // CONVENIENCE ERROR METHODS
  // ================================================================

  /**
   * Create not found error
   */
  createNotFound(message: string = 'Resource not found'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
      reason: ApiErrorReasons.RESOURCE_NOT_FOUND,
      domain: this.domain
    };

    return this.createError(
      ApiStatusCodes.NOT_FOUND,
      message,
      'NOT_FOUND',
      [errorInfo]
    );
  }

  /**
   * Create unauthorized error
   */
  createUnauthorized(message: string = 'Authentication required'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
      reason: ApiErrorReasons.UNAUTHENTICATED,
      domain: this.domain
    };

    return this.createError(
      ApiStatusCodes.UNAUTHORIZED,
      message,
      'UNAUTHORIZED',
      [errorInfo]
    );
  }

  /**
   * Create forbidden error
   */
  createForbidden(message: string = 'Access forbidden'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
      reason: ApiErrorReasons.PERMISSION_DENIED,
      domain: this.domain
    };

    return this.createError(
      ApiStatusCodes.FORBIDDEN,
      message,
      'FORBIDDEN',
      [errorInfo]
    );
  }

  /**
   * Create conflict error
   */
  createConflict(message: string = 'Resource already exists'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
      reason: ApiErrorReasons.RESOURCE_ALREADY_EXISTS,
      domain: this.domain
    };

    return this.createError(
      ApiStatusCodes.CONFLICT,
      message,
      'CONFLICT',
      [errorInfo]
    );
  }

  /**
   * Create internal server error
   */
  createInternalError(message: string = 'Internal server error'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
      reason: ApiErrorReasons.INTERNAL_ERROR,
      domain: this.domain
    };

    return this.createError(
      ApiStatusCodes.INTERNAL_SERVER_ERROR,
      message,
      'INTERNAL_SERVER_ERROR',
      [errorInfo]
    );
  }

  // ================================================================
  // TRPC ERROR HANDLING
  // ================================================================

  /**
   * Convert tRPC error to API response format
   */
  formatTRPCError(error: TRPCError): ApiErrorResponse {
    const { code, message } = error;
    const statusMapping = this.mapTRPCCodeToStatus(code);
    
    const errorInfo: ApiErrorInfo = {
      '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
      reason: statusMapping.reason,
      domain: this.domain
    };
    
    return this.createError(
      statusMapping.httpCode,
      message,
      statusMapping.status,
      [errorInfo]
    );
  }

  /**
   * Create tRPC error with simple parameters
   */
  private createSimpleTRPCError(
    code: string,
    message: string,
    cause?: unknown
  ): TRPCError {
    return new TRPCError({
      code: code as any, // tRPC's type constraint
      message,
      cause
    });
  }

  // ================================================================
  // BACKWARD COMPATIBILITY METHODS
  // ================================================================

  /**
   * Create not found error - backward compatible
   */
  createNotFoundError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    resource?: string,
    context?: { requestId?: string }
  ): TRPCError {
    const message = resource ? `${resource} not found` : 'Resource not found';
    const apiResponse = this.createNotFound(message);
    return this.createSimpleTRPCError('NOT_FOUND', message, apiResponse);
  }

  /**
   * Create conflict error - backward compatible
   */
  createConflictError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    message?: string,
    context?: { requestId?: string }
  ): TRPCError {
    const errorMessage = message || 'Resource already exists';
    const apiResponse = this.createConflict(errorMessage);
    return this.createSimpleTRPCError('CONFLICT', errorMessage, apiResponse);
  }

  /**
   * Create unauthorized error - backward compatible
   */
  createUnauthorizedError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    context?: { requestId?: string }
  ): TRPCError {
    const message = 'Unauthorized access';
    const apiResponse = this.createUnauthorized(message);
    return this.createSimpleTRPCError('UNAUTHORIZED', message, apiResponse);
  }

  /**
   * Create forbidden error - backward compatible
   */
  createForbiddenError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    context?: { requestId?: string }
  ): TRPCError {
    const message = 'Access forbidden';
    const apiResponse = this.createForbidden(message);
    return this.createSimpleTRPCError('FORBIDDEN', message, apiResponse);
  }

  /**
   * Create database error - backward compatible
   */
  createDatabaseError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    error?: Error,
    context?: { requestId?: string }
  ): TRPCError {
    const message = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Database operation failed'
      : 'Database operation failed';
    const apiResponse = this.createInternalError(message);
    return this.createSimpleTRPCError('INTERNAL_SERVER_ERROR', message, apiResponse);
  }

  /**
   * Create business logic error - backward compatible
   */
  createBusinessLogicError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    message?: string,
    context?: { requestId?: string }
  ): TRPCError {
    const errorMessage = message || 'Business logic error';
    const apiResponse = this.createError(
      ApiStatusCodes.BAD_REQUEST,
      errorMessage,
      'BAD_REQUEST'
    );
    return this.createSimpleTRPCError('BAD_REQUEST', errorMessage, apiResponse);
  }

  /**
   * Create validation error - backward compatible
   */
  createValidationTRPCError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    errors?: Array<{ field: string; message: string }>,
    context?: { requestId?: string }
  ): TRPCError {
    const fieldErrors = errors || [];
    const message = fieldErrors.length > 0 
      ? `Validation failed: ${fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
      : 'Validation failed';
    
    const apiResponse = this.createValidationError(fieldErrors);
    return this.createSimpleTRPCError('BAD_REQUEST', message, apiResponse);
  }

  /**
   * Create generic tRPC error with error level code - backward compatible
   */
  createTRPCErrorWithCodes(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    errorLevelCode?: ErrorLevelCode,
    message?: string,
    context?: { requestId?: string }
  ): TRPCError {
    const errorMessage = message || 'An error occurred';
    let trpcCode = 'INTERNAL_SERVER_ERROR';
    let apiResponse: ApiErrorResponse;
    
    // Map common error levels to tRPC codes
    if (errorLevelCode !== undefined && errorLevelCode !== null) {
      switch (errorLevelCode) {
        case ErrorLevelCode.VALIDATION:
          trpcCode = 'BAD_REQUEST';
          apiResponse = this.createError(ApiStatusCodes.BAD_REQUEST, errorMessage, 'BAD_REQUEST');
          break;
        case ErrorLevelCode.NOT_FOUND:
          trpcCode = 'NOT_FOUND';
          apiResponse = this.createNotFound(errorMessage);
          break;
        case ErrorLevelCode.AUTHORIZATION:
        case ErrorLevelCode.AUTHENTICATION_ERROR:
        case ErrorLevelCode.TOKEN_ERROR:
          trpcCode = 'UNAUTHORIZED';
          apiResponse = this.createUnauthorized(errorMessage);
          break;
        case ErrorLevelCode.FORBIDDEN:
          trpcCode = 'FORBIDDEN';
          apiResponse = this.createForbidden(errorMessage);
          break;
        case ErrorLevelCode.CONFLICT:
          trpcCode = 'CONFLICT';
          apiResponse = this.createConflict(errorMessage);
          break;
        case ErrorLevelCode.BUSINESS_LOGIC_ERROR:
          trpcCode = 'BAD_REQUEST';
          apiResponse = this.createError(ApiStatusCodes.BAD_REQUEST, errorMessage, 'BAD_REQUEST');
          break;
        default:
          apiResponse = this.createInternalError(errorMessage);
          break;
      }
    } else {
      apiResponse = this.createInternalError(errorMessage);
    }
    
    return this.createSimpleTRPCError(trpcCode, errorMessage, apiResponse);
  }

  /**
   * Create generic tRPC error - backward compatible (legacy method name)
   */
  createTRPCError(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    errorLevelCode?: ErrorLevelCode,
    message?: string,
    context?: { requestId?: string }
  ): TRPCError {
    return this.createTRPCErrorWithCodes(moduleCode, operationCode, errorLevelCode, message, context);
  }

  // ================================================================
  // SUCCESS RESPONSE METHODS FOR CRUD OPERATIONS (BACKWARD COMPATIBLE)
  // ================================================================

  /**
   * Create success response for CREATE operations - backward compatible
   */
  createCreatedResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    resource?: string,
    data?: T,
    context?: { requestId?: string }
  ): ApiSuccessResponse<T> {
    return this.createSuccess(data, { requestId: context?.requestId });
  }

  /**
   * Create success response for READ operations - backward compatible
   */
  createReadResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    resource?: string,
    data?: T,
    context?: { requestId?: string }
  ): ApiSuccessResponse<T> {
    return this.createSuccess(data, { requestId: context?.requestId });
  }

  /**
   * Create success response for UPDATE operations - backward compatible
   */
  createUpdatedResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    resource?: string,
    data?: T,
    context?: { requestId?: string }
  ): ApiSuccessResponse<T> {
    return this.createSuccess(data, { requestId: context?.requestId });
  }

  /**
   * Create success response for DELETE operations - backward compatible
   */
  createDeletedResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    resource?: string,
    data?: T,
    context?: { requestId?: string }
  ): ApiSuccessResponse<T> {
    return this.createSuccess(data, { requestId: context?.requestId });
  }

  /**
   * Create success response for general operations - backward compatible
   */
  createSuccessResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    operationCode?: OperationCode | null,
    messageLevelCode?: MessageLevelCode | null,
    message?: string,
    data?: T,
    context?: { requestId?: string }
  ): ApiSuccessResponse<T> {
    return this.createSuccess(data, { requestId: context?.requestId });
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  private mapTRPCCodeToStatus(trpcCode: string): {
    httpCode: number;
    status: string;
    reason: ApiErrorReasons;
  } {
    switch (trpcCode) {
      case 'UNAUTHORIZED':
        return {
          httpCode: ApiStatusCodes.UNAUTHORIZED,
          status: 'UNAUTHORIZED',
          reason: ApiErrorReasons.UNAUTHENTICATED
        };
      case 'FORBIDDEN':
        return {
          httpCode: ApiStatusCodes.FORBIDDEN,
          status: 'FORBIDDEN',
          reason: ApiErrorReasons.PERMISSION_DENIED
        };
      case 'NOT_FOUND':
        return {
          httpCode: ApiStatusCodes.NOT_FOUND,
          status: 'NOT_FOUND',
          reason: ApiErrorReasons.RESOURCE_NOT_FOUND
        };
      case 'CONFLICT':
        return {
          httpCode: ApiStatusCodes.CONFLICT,
          status: 'CONFLICT',
          reason: ApiErrorReasons.RESOURCE_ALREADY_EXISTS
        };
      case 'UNSUPPORTED_MEDIA_TYPE':
        return {
          httpCode: ApiStatusCodes.BAD_REQUEST,
          status: 'BAD_REQUEST',
          reason: ApiErrorReasons.UNSUPPORTED_MEDIA_TYPE
        };
      case 'BAD_REQUEST':
      case 'PARSE_ERROR':
      default:
        return {
          httpCode: ApiStatusCodes.BAD_REQUEST,
          status: 'BAD_REQUEST',
          reason: ApiErrorReasons.INVALID_REQUEST
        };
      case 'INTERNAL_SERVER_ERROR':
        return {
          httpCode: ApiStatusCodes.INTERNAL_SERVER_ERROR,
          status: 'INTERNAL_SERVER_ERROR',
          reason: ApiErrorReasons.INTERNAL_ERROR
        };
    }
  }
} 