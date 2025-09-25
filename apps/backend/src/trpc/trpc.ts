import { initTRPC, TRPCError } from '@trpc/server';
import { AuthenticatedContext } from './context';
import { ApiErrorReasons, ApiStatusCodes, UserRole } from '@shared';
import { createErrorFormatter } from './error-formatter';

// Initialize tRPC with context and errorFormatter
const t = initTRPC.context<AuthenticatedContext>().create({
  errorFormatter: createErrorFormatter('initTRPC.create'),
});

// Export router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is guaranteed to be defined
    },
  });
});

// Admin procedure that requires admin role
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (ctx.user.role !== UserRole.ADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is guaranteed to be defined
    },
  });
}); 