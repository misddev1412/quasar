import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedContext } from '../context';

/**
 * Custom decorator to extract current user from tRPC context
 * Must be used with AuthMiddleware
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedContext['user'] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // For tRPC, the context is usually available in the request
    const context = request.ctx as AuthenticatedContext;
    
    if (!context?.user) {
      throw new Error('User not found in context. Make sure AuthMiddleware is applied.');
    }
    
    // Return specific user property if requested, otherwise return entire user
    return data ? context.user[data] : context.user;
  },
);

/**
 * Decorator specifically for getting current user ID
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const context = request.ctx as AuthenticatedContext;
    
    if (!context?.user) {
      throw new Error('User not found in context. Make sure AuthMiddleware is applied.');
    }
    
    return context.user.id;
  },
); 