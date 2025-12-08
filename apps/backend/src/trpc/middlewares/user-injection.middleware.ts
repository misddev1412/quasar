import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';

/**
 * Middleware that injects authenticated user information into procedure parameters
 * Must be used after AuthMiddleware
 */
@Injectable()
export class UserInjectionMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    // This middleware should be used after AuthMiddleware, so user should exist
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        // Add additional user info to context for easy access
        userId: ctx.user.id,
        userRole: ctx.user.role,
        userEmail: ctx.user.email,
      },
    });
  }
} 