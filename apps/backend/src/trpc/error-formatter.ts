import { formatZodError, isZodError } from './utils/zod-error-formatter';

/**
 * Shared error formatter for tRPC
 * Can be used in both initTRPC.create() and TRPCModule.forRoot()
 */
export const createErrorFormatter = (source = 'unknown') => {
  return ({ shape, error }: { shape: any; error: any }) => {
    // Get the error data from the cause if available (from our ResponseService)
    const errorCause = error.cause as any;
    
    // Check if this is a ZodError and format it properly
    if (isZodError(errorCause)) {
      const formattedError = formatZodError(errorCause);
      return formattedError;
    }
    
    // Check if error.cause is ZodError (in case it's nested)
    if (error.cause && isZodError(error.cause)) {
      const formattedError = formatZodError(error.cause);
      return formattedError;
    }
    
    // If we have pre-formatted error data from our ResponseService, use it directly
    if (errorCause?.errorData) {
      return errorCause.errorData;
    }
    
    // Fallback for errors not created by ResponseService
    const code = errorCause?.httpStatus || 500;
    const status = error.code || 'INTERNAL_SERVER_ERROR';
    const errors = [{
      '@type': 'ErrorInfo',
      reason: error.code || 'INTERNAL_SERVER_ERROR',
      domain: 'quasar.com',
      metadata: shape.data || {}
    }];
    
    const result = {
      code,
      status,
      message: error.message,
      errors,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    };
    
    console.log(`Fallback result (${source}):`, result);
    return result;
  };
}; 