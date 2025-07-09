import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import {
  ApiLocalizedMessage,
  ApiPreconditionFailure,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorInfo,
  ApiBadRequest,
  TrpcApiResponse,
  ModuleCode,
  OperationCode,
  ApiListResponse,
  ApiErrorReasons,
  ApiStatusCodes
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
  private readonly domain = 'quasar.com'; // Domain for error responses

  // ================================================================
  // tRPC RESPONSE METHODS
  // ================================================================

  /**
   * Create a standardized tRPC API response
   */
  createTrpcResponse<T>(
    code: number,
    status: string,
    data?: T,
    errors?: Array<ApiErrorInfo | ApiLocalizedMessage | ApiBadRequest>
  ): TrpcApiResponse<T> {
    return {
      code,
      status,
      data,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a standardized tRPC success response
   */
  createTrpcSuccess<T>(data: T): TrpcApiResponse<T> {
    return this.createTrpcResponse(
      ApiStatusCodes.OK,
      'OK',
      data
    );
  }

  /**
   * Create a standardized tRPC error response
   */
  createTrpcError(
    code: number,
    status: string,
    message: string,
    errorReason: ApiErrorReasons = ApiErrorReasons.INTERNAL_ERROR
  ): TrpcApiResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'ErrorInfo',
      reason: errorReason,
      domain: this.domain
    };

    this.logger.error(`API Error [${code}]: ${message}`, {
      code,
      status,
      errorInfo
    });

    return this.createTrpcResponse(
      code,
      status,
      undefined,
      [errorInfo]
    );
  }

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
      '@type': 'BadRequest',
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
      '@type': 'ErrorInfo',
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
   * Create forbidden error
   */
  createForbidden(message: string = 'Access forbidden'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'ErrorInfo',
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
   * Create internal server error
   */
  createInternalError(message: string = 'Internal server error'): ApiErrorResponse {
    const errorInfo: ApiErrorInfo = {
      '@type': 'ErrorInfo',
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
  // TRPC ERROR HELPERS
  // ================================================================

  /**
   * Create a TRPC error
   */
  createTRPCError(
    moduleCode: ModuleCode | null,
    operationCode: OperationCode | null,
    errorLevelCode: ErrorLevelCode | null,
    message: string
  ): TRPCError {
    // Map error level to HTTP status
    let httpStatus = 500;
    let code: string = 'INTERNAL_SERVER_ERROR';

    if (errorLevelCode === ErrorLevelCode.NOT_FOUND) {
      httpStatus = 404;
      code = 'NOT_FOUND';
    } else if (errorLevelCode === ErrorLevelCode.VALIDATION) {
      httpStatus = 400;
      code = 'BAD_REQUEST';
    } else if (errorLevelCode === ErrorLevelCode.AUTHORIZATION) {
      httpStatus = 403;
      code = 'FORBIDDEN';
    } else if (errorLevelCode === ErrorLevelCode.AUTHENTICATION_ERROR) {
      httpStatus = 401;
      code = 'UNAUTHORIZED';
    } else if (errorLevelCode === ErrorLevelCode.BUSINESS_LOGIC_ERROR) {
      httpStatus = 422;
      code = 'UNPROCESSABLE_CONTENT';
    }

    this.logger.error(`TRPC Error [${httpStatus}]: ${message}`, {
      moduleCode,
      operationCode,
      errorLevelCode
    });

    // Prepare our standardized error format that will be used by the errorFormatter
    const errorData = {
      code: httpStatus,
      status: code,
      errors: [{
        '@type': 'ErrorInfo',
        reason: code,
        domain: this.domain
      }]
    };

    return new TRPCError({
      code: code as any,
      message,
      cause: { httpStatus, errorData }
    });
  }

  /**
   * Create a TRPC error with standardized error codes
   */
  createTRPCErrorWithCodes(
    moduleCode: ModuleCode | null,
    operationCode: OperationCode | null,
    errorLevelCode: ErrorLevelCode | null,
    message: string
  ): TRPCError {
    return this.createTRPCError(moduleCode, operationCode, errorLevelCode, message);
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
  ): TrpcApiResponse<T> {
    return this.createTrpcSuccess(data);
  }

  /**
   * Create success response for READ operations - backward compatible
   */
  createReadResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    resource?: string,
    data?: T,
    context?: { requestId?: string }
  ): TrpcApiResponse<T> {
    return this.createTrpcSuccess(data);
  }

  /**
   * Create success response for UPDATE operations - backward compatible
   */
  createUpdatedResponse<T = unknown>(
    moduleCode?: ModuleCode | null,
    resource?: string,
    data?: T,
    context?: { requestId?: string }
  ): TrpcApiResponse<T> {
    return this.createTrpcSuccess(data);
  }

  /**
   * Create success response for DELETE operations - backward compatible
   */
  createDeletedResponse(
    moduleCode?: ModuleCode | null,
    resource?: string,
    context?: { requestId?: string }
  ): TrpcApiResponse {
    return this.createTrpcResponse(
      ApiStatusCodes.OK,
      'OK',
      { deleted: true }
    );
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
  ): TrpcApiResponse<T> {
    return this.createTrpcSuccess(data);
  }
} 