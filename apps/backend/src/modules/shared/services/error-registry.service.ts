import { Injectable } from '@nestjs/common';
import { errorRegistry, ErrorRegistryEntry } from '../registry/error-registry';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared';

/**
 * Error Registry Service
 * NestJS service wrapper for error registry
 */
@Injectable()
export class ErrorRegistryService {
  /**
   * Get error entry by code
   */
  getError(code: string): ErrorRegistryEntry | undefined {
    return errorRegistry.getError(code);
  }

  /**
   * Get all errors for a module
   */
  getErrorsByModule(moduleCode: ModuleCode): ErrorRegistryEntry[] {
    return errorRegistry.getErrorsByModule(moduleCode);
  }

  /**
   * Get all errors for an operation
   */
  getErrorsByOperation(operationCode: OperationCode): ErrorRegistryEntry[] {
    return errorRegistry.getErrorsByOperation(operationCode);
  }

  /**
   * Get all errors by error level
   */
  getErrorsByLevel(errorLevelCode: ErrorLevelCode): ErrorRegistryEntry[] {
    return errorRegistry.getErrorsByLevel(errorLevelCode);
  }

  /**
   * Get all registered errors
   */
  getAllErrors(): ErrorRegistryEntry[] {
    return errorRegistry.getAllErrors();
  }

  /**
   * Search errors by title or description
   */
  searchErrors(query: string): ErrorRegistryEntry[] {
    return errorRegistry.searchErrors(query);
  }

  /**
   * Validate if error code exists
   */
  validateErrorCode(code: string): boolean {
    return errorRegistry.validateErrorCode(code);
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    totalErrors: number;
    errorsByModule: Record<string, number>;
    errorsByOperation: Record<string, number>;
    errorsByLevel: Record<string, number>;
  } {
    return errorRegistry.getStatistics();
  }

  /**
   * Generate error documentation
   */
  generateDocumentation(): string {
    return errorRegistry.generateDocumentation();
  }

  /**
   * Get error info for debugging
   */
  getErrorInfo(code: string): {
    exists: boolean;
    entry?: ErrorRegistryEntry;
    suggestions?: string[];
  } {
    const entry = this.getError(code);
    const exists = entry !== undefined;
    
    if (!exists) {
      // Find similar error codes
      const allErrors = this.getAllErrors();
      const suggestions = allErrors
        .filter(e => e.code.includes(code.substring(0, 3))) // Same module
        .map(e => e.code)
        .slice(0, 5);
      
      return { exists, suggestions };
    }
    
    return { exists, entry };
  }

  /**
   * Get error codes for module and operation
   */
  getErrorCodesForOperation(moduleCode: ModuleCode, operationCode: OperationCode): string[] {
    return errorRegistry
      .getAllErrors()
      .filter(error => error.moduleCode === moduleCode && error.operationCode === operationCode)
      .map(error => error.code);
  }

  /**
   * Check if error code is valid for context
   */
  isValidErrorForContext(
    code: string,
    moduleCode: ModuleCode,
    operationCode: OperationCode
  ): boolean {
    const entry = this.getError(code);
    if (!entry) return false;
    
    return entry.moduleCode === moduleCode && entry.operationCode === operationCode;
  }

  /**
   * Get recommended error codes for context
   */
  getRecommendedErrorCodes(
    moduleCode: ModuleCode,
    operationCode: OperationCode
  ): ErrorRegistryEntry[] {
    return errorRegistry
      .getAllErrors()
      .filter(error => error.moduleCode === moduleCode && error.operationCode === operationCode)
      .sort((a, b) => a.title.localeCompare(b.title));
  }
} 