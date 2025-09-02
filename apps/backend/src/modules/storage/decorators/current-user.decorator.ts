import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Custom decorator to extract current user from REST request
 * Must be used with JwtAuthGuard
 */
export const GetCurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): AuthenticatedUser | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    
    if (!user) {
      throw new Error('User not found in request. Make sure JwtAuthGuard is applied.');
    }
    
    return data ? user[data] : user;
  },
);

/**
 * Decorator specifically for getting current user ID
 */
export const GetCurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    
    if (!user) {
      throw new Error('User not found in request. Make sure JwtAuthGuard is applied.');
    }
    
    return user.id;
  },
);