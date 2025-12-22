import { formatZodError, isZodError } from './utils/zod-error-formatter';

/**
 * Map TRPC error code to HTTP status code
 */
function mapTRPCErrorCodeToStatus(code: string): number {
  switch (code) {
    case 'BAD_REQUEST': return 400;
    case 'UNAUTHORIZED': return 401;
    case 'FORBIDDEN': return 403;
    case 'NOT_FOUND': return 404;
    case 'TIMEOUT': return 408;
    case 'CONFLICT': return 409;
    case 'PRECONDITION_FAILED': return 412;
    case 'PAYLOAD_TOO_LARGE': return 413;
    case 'METHOD_NOT_SUPPORTED': return 405;
    case 'UNPROCESSABLE_CONTENT': return 422;
    case 'TOO_MANY_REQUESTS': return 429;
    case 'CLIENT_CLOSED_REQUEST': return 499;
    case 'INTERNAL_SERVER_ERROR': 
    default: return 500;
  }
}

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
    
    // Map TRPC error code to HTTP status code
    // If httpStatus is provided in cause, use it; otherwise map from TRPC error code
    const trpcErrorCode = error.code || 'INTERNAL_SERVER_ERROR';
    const code = errorCause?.httpStatus || mapTRPCErrorCodeToStatus(trpcErrorCode);
    const status = trpcErrorCode;
    const errors = [{
      '@type': 'ErrorInfo',
      reason: trpcErrorCode,
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
    
    return result;
  };
};
