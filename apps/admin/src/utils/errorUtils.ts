interface FieldViolation {
  field: string;
  description: string;
}

interface StructuredError {
  '@type': string;
  fieldViolations: FieldViolation[];
}

interface ErrorResponse {
  code?: number;
  status?: string;
  message?: string;
  errors?: StructuredError[];
  timestamp?: string;
}

export function parseValidationErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  try {
    // Check if error has the structured format
    if (error?.data && Array.isArray(error.data)) {
      const errorData = error.data[0]?.error as ErrorResponse;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        for (const structuredError of errorData.errors) {
          if (structuredError.fieldViolations && Array.isArray(structuredError.fieldViolations)) {
            for (const violation of structuredError.fieldViolations) {
              if (violation.field && violation.description) {
                fieldErrors[violation.field] = violation.description;
              }
            }
          }
        }
      }
    }
    
    // Fallback: try to parse from error message if no structured errors found
    if (Object.keys(fieldErrors).length === 0 && error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('name')) {
        fieldErrors.name = 'Configuration name is required and must be unique';
      }
      if (message.includes('api key') || message.includes('apikey')) {
        fieldErrors.apiKey = 'Web API key is required';
      }
      if (message.includes('auth domain') || message.includes('authdomain')) {
        fieldErrors.authDomain = 'Auth domain is required';
      }
      if (message.includes('project id') || message.includes('projectid')) {
        fieldErrors.projectId = 'Project ID is required';
      }
      if (message.includes('app id') || message.includes('appid')) {
        fieldErrors.appId = 'App ID is required';
      }
      if (message.includes('service account') || message.includes('json')) {
        fieldErrors.serviceAccountKey = 'Invalid service account key format. Must be valid JSON';
      }
    }
  } catch (parseError) {
    console.error('Error parsing validation errors:', parseError);
  }
  
  return fieldErrors;
}

export function getErrorMessage(error: any): string {
  // Try to get message from structured error first
  if (error?.data && Array.isArray(error.data)) {
    const errorData = error.data[0]?.error as ErrorResponse;
    if (errorData?.message) {
      return errorData.message;
    }
  }
  
  // Fallback to standard error message
  return error?.message || 'An unexpected error occurred';
}

export function isValidationError(error: any): boolean {
  // Check for structured validation errors
  if (error?.data && Array.isArray(error.data)) {
    const errorData = error.data[0]?.error as ErrorResponse;
    return errorData?.code === 400 || errorData?.status === 'BAD_REQUEST';
  }
  
  // Fallback to message-based detection
  const message = error?.message?.toLowerCase() || '';
  return message.includes('validation') || 
         message.includes('required') || 
         message.includes('invalid') ||
         message.includes('must be at least');
}