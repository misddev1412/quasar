import { initTRPC, TRPCError } from '@trpc/server';
import { AuthenticatedContext } from './context';
import { ApiErrorReasons, ApiStatusCodes } from '@shared';

// Initialize tRPC with context
const t = initTRPC.context<AuthenticatedContext>().create({
  errorFormatter: ({ shape, error }) => {
    // Get the error data from the cause if available (from our ResponseService)
    const errorCause = error.cause as any;
    const errorData = errorCause?.errorData;
    
    if (errorData) {
      // Use our pre-formatted error data
      return {
        ...errorData,
        message: error.message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      };
    }
    
    // Otherwise, format it ourselves
    const httpStatus = errorCause?.httpStatus || 500;
    return {
      code: httpStatus,
      status: error.code,
      message: error.message,
      errors: [{
        '@type': 'ErrorInfo',
        reason: error.code,
        domain: 'quasar.com',
        metadata: shape.data || {}
      }],
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    };
  },
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