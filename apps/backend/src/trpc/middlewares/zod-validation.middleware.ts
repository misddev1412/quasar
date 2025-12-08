import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';
import { isZodError, formatZodError } from '../utils/zod-error-formatter';

/**
 * Middleware to handle Zod validation errors
 * Catches ZodError and transforms it into a standardized BAD_REQUEST response
 */
@Injectable()
export class ZodValidationMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    try {
      return await next({
        ctx,
      });
    } catch (error) {
      // Check if the error is a ZodError
      if (isZodError(error)) {
        const formattedError = formatZodError(error);
        
        // Throw a TRPCError with the formatted error data as cause
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: formattedError.message,
          cause: {
            errorData: formattedError,
          },
        });
      }
      
      // If it's not a ZodError, re-throw the original error
      throw error;
    }
  }
}

/**
 * Factory function to create the middleware instance
 * Can be used in procedure chains
 */
export const createZodValidationMiddleware = () => {
  return new ZodValidationMiddleware();
}; 