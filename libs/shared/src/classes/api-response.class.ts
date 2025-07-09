import { HttpStatus } from '@nestjs/common';

export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path?: string;
  statusCode: number;
  meta?: {
    version?: string;
    requestId?: string;
    [key: string]: any;
  };

  constructor(
    success: boolean,
    message: string,
    statusCode: number = HttpStatus.OK,
    data?: T,
    error?: string,
    path?: string,
    meta?: any
  ) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.error = error;
    this.path = path;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  // Static factory methods for common response patterns
  static success<T>(
    data?: T,
    message: string = 'Operation completed successfully',
    statusCode: number = HttpStatus.OK,
    meta?: any
  ): ApiResponse<T> {
    return new ApiResponse(true, message, statusCode, data, undefined, undefined, meta);
  }

  static error(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string,
    path?: string,
    meta?: any
  ): ApiResponse<null> {
    return new ApiResponse(false, message, statusCode, null, error, path, meta);
  }

  static created<T>(
    data?: T,
    message: string = 'Resource created successfully',
    meta?: any
  ): ApiResponse<T> {
    return new ApiResponse(true, message, HttpStatus.CREATED, data, undefined, undefined, meta);
  }

  static noContent(message: string = 'Operation completed successfully'): ApiResponse<null> {
    return new ApiResponse(true, message, HttpStatus.NO_CONTENT);
  }

  static badRequest(
    message: string = 'Bad request',
    error?: string,
    path?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, HttpStatus.BAD_REQUEST, null, error, path);
  }

  static unauthorized(
    message: string = 'Unauthorized access',
    error?: string,
    path?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, HttpStatus.UNAUTHORIZED, null, error, path);
  }

  static forbidden(
    message: string = 'Access forbidden',
    error?: string,
    path?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, HttpStatus.FORBIDDEN, null, error, path);
  }

  static notFound(
    message: string = 'Resource not found',
    error?: string,
    path?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, HttpStatus.NOT_FOUND, null, error, path);
  }

  static conflict(
    message: string = 'Resource already exists',
    error?: string,
    path?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, HttpStatus.CONFLICT, null, error, path);
  }

  static validationError(
    message: string = 'Validation failed',
    error?: string,
    path?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, HttpStatus.UNPROCESSABLE_ENTITY, null, error, path);
  }

  // Helper methods
  setPath(path: string): this {
    this.path = path;
    return this;
  }

  addMeta(key: string, value: any): this {
    if (!this.meta) {
      this.meta = {};
    }
    this.meta[key] = value;
    return this;
  }

  setRequestId(requestId: string): this {
    return this.addMeta('requestId', requestId);
  }

  setVersion(version: string): this {
    return this.addMeta('version', version);
  }

  // Convert to plain object for serialization
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      error: this.error,
      timestamp: this.timestamp,
      path: this.path,
      statusCode: this.statusCode,
      meta: this.meta,
    };
  }
} 