import { initTRPC, TRPCError } from '@trpc/server';
import { AuthenticatedContext } from './context';

// Initialize tRPC with context
const t = initTRPC.context<AuthenticatedContext>().create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        // Safe access to httpStatus if it exists
        httpStatus: (error.cause as any)?.httpStatus || (error as any)?.httpStatus,
      },
    };
  },
});

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;

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