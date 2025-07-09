import { initTRPC, TRPCError } from '@trpc/server';
import { AuthenticatedContext } from './context';
import { ApiErrorReasons, ApiStatusCodes } from '@shared';

// Initialize tRPC with context
const t = initTRPC.context<AuthenticatedContext>().create({
  errorFormatter: ({ shape, error }) => {
    // Get the error data from the cause if available (from our ResponseService)
    const errorCause = error.cause as any;
    
    // Default values
    let code = errorCause?.httpStatus || 500;
    let status = error.code || 'INTERNAL_SERVER_ERROR';
    let errors = [{
      '@type': 'ErrorInfo',
      reason: error.code || 'INTERNAL_SERVER_ERROR',
      domain: 'quasar.com',
      metadata: shape.data || {}
    }];
    
    // If we have pre-formatted error data from our ResponseService, use it
    if (errorCause?.errorData) {
      const errorData = errorCause.errorData;
      code = errorData.code || code;
      status = errorData.status || status;
      errors = errorData.errors || errors;
    }
    
    // Return standardized format
    return {
      code,
      status,
      message: error.message,
      errors,
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