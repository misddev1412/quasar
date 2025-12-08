import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { TRPCError } from '@trpc/server';
import { isZodError, formatZodError } from '../../../trpc/utils/zod-error-formatter';

@Catch()
export class TRPCExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TRPCExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Only handle tRPC routes
    if (!request.url || !request.url.startsWith('/trpc/')) {
      throw exception; // Re-throw for other routes
    }

    let code = 500;
    let status = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let errors = [{
      '@type': 'ErrorInfo',
      reason: 'INTERNAL_SERVER_ERROR',
      domain: 'quasar.com',
    }];

    // Check if this is a ZodError first (highest priority)
    if (isZodError(exception)) {
      const formattedError = formatZodError(exception);
      return response.status(formattedError.code).json(formattedError);
    }

    // Handle TRPCError
    if (exception instanceof TRPCError) {
      const cause = (exception.cause as any) || {};
      
      // Check if we have custom error data from ResponseService
      if (cause.errorData) {
        const errorData = cause.errorData;
        return response.status(errorData.code || 500).json(errorData);
      }
      
      // Check if the cause is a ZodError
      if (isZodError(cause)) {
        const formattedError = formatZodError(cause);
        return response.status(formattedError.code).json(formattedError);
      }
      
      if (isZodError(exception.cause)) {
        const formattedError = formatZodError(exception.cause);
        return response.status(formattedError.code).json(formattedError);
      }
      
      // Fallback for standard TRPCError
      code = this.mapTRPCErrorCodeToStatus(exception.code);
      status = exception.code;
      message = exception.message;
      errors = [{
        '@type': 'ErrorInfo',
        reason: exception.code,
        domain: 'quasar.com',
      }];
    } else if (exception instanceof Error) {
      // Check if this Error wraps a ZodError
      const errorAsAny = exception as any;
      if (isZodError(errorAsAny.cause)) {
        const formattedError = formatZodError(errorAsAny.cause);
        return response.status(formattedError.code).json(formattedError);
      }
      
      message = exception.message;
      
      // Check if this is our custom error with attached properties
      const customError = exception as any;
      if (customError.code && customError.status && customError.errors) {
        return response.status(customError.code).json({
          code: customError.code,
          status: customError.status,
          message: customError.message,
          errors: customError.errors,
          timestamp: customError.timestamp
        });
      }
    }

    this.logger.error(`tRPC Exception: ${message}`, exception instanceof Error ? exception.stack : undefined);

    // Return standardized error response
    const errorResponse = {
      code,
      status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: exception instanceof Error ? exception.stack : undefined 
      }),
    };

    response.status(code).json(errorResponse);
  }

  private mapTRPCErrorCodeToStatus(code: string): number {
    switch (code) {
      case 'BAD_REQUEST': return 400;
      case 'UNAUTHORIZED': return 401;
      case 'FORBIDDEN': return 403;
      case 'NOT_FOUND': return 404;
      case 'TIMEOUT': return 408;
      case 'CONFLICT': return 409;
      case 'PRECONDITION_FAILED': return 412;
      case 'PAYLOAD_TOO_LARGE': return 413;
      case 'METHOD_NOT_SUPPORTED': return 405;
      case 'UNPROCESSABLE_CONTENT': return 422;
      case 'TOO_MANY_REQUESTS': return 429;
      case 'CLIENT_CLOSED_REQUEST': return 499;
      case 'INTERNAL_SERVER_ERROR': 
      default: return 500;
    }
  }
} 