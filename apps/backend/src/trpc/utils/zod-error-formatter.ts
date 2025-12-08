import { ZodError, ZodIssue } from 'zod';
import { ApiStatusCodes } from '@shared';

export interface ZodValidationError {
  field: string;
  message: string;
  code: string;
  expected?: string;
  received?: string;
}

export interface FormattedZodError {
  code: number;
  status: string;
  message: string;
  errors: Array<{
    '@type': 'BadRequest';
    fieldViolations: Array<{
      field: string;
      description: string;
    }>;
  }>;
  timestamp: string;
}

/**
 * Formats ZodError into a standardized API error response
 */
export function formatZodError(error: ZodError): FormattedZodError {
  const fieldViolations = error.issues.map((issue: ZodIssue) => {
    const field = issue.path.join('.');
    let message = issue.message;
    
    // Create more user-friendly messages based on error type
    switch (issue.code) {
      case 'invalid_type':
        if (issue.expected === 'string' && issue.received === 'undefined') {
          message = `${field} is required`;
        } else {
          message = `${field} must be ${getEnglishType(issue.expected)}, received ${getEnglishType(issue.received)}`;
        }
        break;
      case 'too_small':
        if (issue.type === 'string') {
          message = `${field} must be at least ${issue.minimum} characters`;
        } else {
          message = `${field} is too small. Minimum: ${issue.minimum}`;
        }
        break;
      case 'too_big':
        if (issue.type === 'string') {
          message = `${field} must not exceed ${issue.maximum} characters`;
        } else {
          message = `${field} is too large. Maximum: ${issue.maximum}`;
        }
        break;
      case 'invalid_string':
        if (issue.validation === 'email') {
          message = `${field} must be a valid email address`;
        } else {
          message = `${field} is invalid`;
        }
        break;
      default:
        message = issue.message;
    }

    return {
      field,
      description: message,
    };
  });

  return {
    code: ApiStatusCodes.BAD_REQUEST,
    status: 'BAD_REQUEST',
    message: 'Invalid input data',
    errors: [{
      '@type': 'BadRequest',
      fieldViolations,
    }],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to get English type names
 */
function getEnglishType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
    undefined: 'undefined',
    null: 'null',
  };
  
  return typeMap[type] || type;
}

/**
 * Checks if an error is a ZodError
 */
export function isZodError(error: any): error is ZodError {
  return error instanceof ZodError || (error && error.name === 'ZodError');
} 