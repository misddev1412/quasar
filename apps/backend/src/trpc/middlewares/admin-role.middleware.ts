import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';

@Injectable()
export class AdminRoleMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    // This middleware should be used after AuthMiddleware, so user should exist
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    // Check if user has admin privileges
    if (ctx.user.isSuperAdmin) {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    }

    if (!ctx.user.permissions || ctx.user.permissions.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin permissions required',
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }
} 
