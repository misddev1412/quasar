import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { TRPCError } from '@trpc/server';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default status and error info
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    
    // Extract error details based on exception type
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'object' && 'message' in errorResponse 
        ? String(errorResponse['message'])
        : String(errorResponse);
      errorCode = this.mapHttpStatusToErrorCode(status);
    } else if (exception instanceof TRPCError) {
      // Handle TRPC errors
      const cause = (exception.cause as any) || {};
      status = cause.httpStatus || this.mapTRPCErrorCodeToStatus(exception.code);
      message = exception.message;
      errorCode = exception.code;

      // If we have pre-formatted error data from our ResponseService, use it
      if (cause.errorData) {
        const errorData = cause.errorData;
        return response.status(status).json({
          code: errorData.code || status,
          status: errorData.status || errorCode,
          message: message,
          errors: errorData.errors || [{
            '@type': 'ErrorInfo',
            reason: errorCode,
            domain: 'quasar.com',
          }],
          timestamp: new Date().toISOString(),
          ...(process.env.NODE_ENV !== 'production' && { stack: exception.stack }),
        });
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    this.logger.error(`Exception: ${message}`, exception instanceof Error ? exception.stack : undefined);

    // Return standardized error response
    response.status(status).json({
      code: status,
      status: errorCode,
      message: message,
      errors: [{
        '@type': 'ErrorInfo',
        reason: errorCode,
        domain: 'quasar.com',
      }],
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: exception instanceof Error ? exception.stack : undefined 
      }),
    });
  }

  private mapHttpStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST: return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED: return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN: return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND: return 'NOT_FOUND';
      case HttpStatus.CONFLICT: return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY: return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS: return 'TOO_MANY_REQUESTS';
      case HttpStatus.INTERNAL_SERVER_ERROR: return 'INTERNAL_SERVER_ERROR';
      case HttpStatus.BAD_GATEWAY: return 'BAD_GATEWAY';
      case HttpStatus.SERVICE_UNAVAILABLE: return 'SERVICE_UNAVAILABLE';
      case HttpStatus.GATEWAY_TIMEOUT: return 'GATEWAY_TIMEOUT';
      default: return 'INTERNAL_SERVER_ERROR';
    }
  }

  private mapTRPCErrorCodeToStatus(code: string): number {
    switch (code) {
      case 'BAD_REQUEST': return HttpStatus.BAD_REQUEST;
      case 'UNAUTHORIZED': return HttpStatus.UNAUTHORIZED;
      case 'FORBIDDEN': return HttpStatus.FORBIDDEN;
      case 'NOT_FOUND': return HttpStatus.NOT_FOUND;
      case 'TIMEOUT': return HttpStatus.GATEWAY_TIMEOUT;
      case 'CONFLICT': return HttpStatus.CONFLICT;
      case 'PRECONDITION_FAILED': return HttpStatus.PRECONDITION_FAILED;
      case 'PAYLOAD_TOO_LARGE': return HttpStatus.PAYLOAD_TOO_LARGE;
      case 'METHOD_NOT_SUPPORTED': return HttpStatus.METHOD_NOT_ALLOWED;
      case 'UNPROCESSABLE_CONTENT': return HttpStatus.UNPROCESSABLE_ENTITY;
      case 'INTERNAL_SERVER_ERROR': 
      default: return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
} 