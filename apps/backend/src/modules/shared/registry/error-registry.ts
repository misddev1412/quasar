import { 
  ModuleCode, 
  OperationCode, 
  ErrorLevelCode, 
  ErrorCodeGenerator 
} from '@shared/enums/error-codes.enums';

/**
 * Error registry entry interface
 */
export interface ErrorRegistryEntry {
  code: string;
  moduleCode: ModuleCode;
  operationCode: OperationCode;
  errorLevelCode: ErrorLevelCode;
  title: string;
  description: string;
  httpStatus: number;
  trpcCode: string;
  commonCauses?: string[];
  solutions?: string[];
  examples?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Error registry database
 * Central registry for all application error codes
 */
export class ErrorRegistry {
  private static instance: ErrorRegistry;
  private registry: Map<string, ErrorRegistryEntry> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): ErrorRegistry {
    if (!ErrorRegistry.instance) {
      ErrorRegistry.instance = new ErrorRegistry();
    }
    return ErrorRegistry.instance;
  }

  /**
   * Initialize registry with predefined error codes
   */
  private initializeRegistry(): void {
    // User Module Errors
    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.CREATE,
      errorLevelCode: ErrorLevelCode.VALIDATION,
      title: 'User Creation Validation Error',
      description: 'Input validation failed during user creation',
      commonCauses: ['Invalid email format', 'Password too weak', 'Username too short'],
      solutions: ['Validate email format', 'Use stronger password', 'Use longer username'],
      examples: ['Invalid email: "not-an-email"', 'Password: "123" (too short)']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.CREATE,
      errorLevelCode: ErrorLevelCode.CONFLICT,
      title: 'User Already Exists',
      description: 'User with provided email or username already exists',
      commonCauses: ['Duplicate email', 'Duplicate username'],
      solutions: ['Use different email', 'Use different username'],
      examples: ['Email: "user@example.com already exists"']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.READ,
      errorLevelCode: ErrorLevelCode.NOT_FOUND,
      title: 'User Not Found',
      description: 'User with specified ID does not exist',
      commonCauses: ['Invalid user ID', 'User was deleted', 'User never existed'],
      solutions: ['Verify user ID', 'Check if user exists', 'Use valid user ID'],
      examples: ['User ID: "123e4567-e89b-12d3-a456-426614174000" not found']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.UPDATE,
      errorLevelCode: ErrorLevelCode.FORBIDDEN,
      title: 'User Update Forbidden',
      description: 'User does not have permission to update this resource',
      commonCauses: ['Insufficient permissions', 'Not owner of resource'],
      solutions: ['Request appropriate permissions', 'Update own resources only'],
      examples: ['User trying to update another user\'s profile']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.DELETE,
      errorLevelCode: ErrorLevelCode.BUSINESS_LOGIC_ERROR,
      title: 'User Deletion Not Allowed',
      description: 'User cannot be deleted due to business rules',
      commonCauses: ['User has active orders', 'User is admin', 'User has dependencies'],
      solutions: ['Complete/cancel orders first', 'Transfer admin rights', 'Remove dependencies'],
      examples: ['Cannot delete user with pending orders']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.LOGIN,
      errorLevelCode: ErrorLevelCode.AUTHORIZATION,
      title: 'Login Failed',
      description: 'User authentication failed',
      commonCauses: ['Invalid credentials', 'Account locked', 'Account inactive'],
      solutions: ['Check credentials', 'Unlock account', 'Activate account'],
      examples: ['Wrong password', 'Account locked after 5 failed attempts']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.REGISTER,
      errorLevelCode: ErrorLevelCode.BUSINESS_LOGIC_ERROR,
      title: 'Registration Failed',
      description: 'User registration failed due to business rules',
      commonCauses: ['Registration closed', 'Invalid invitation code', 'Email domain blocked'],
      solutions: ['Wait for registration to open', 'Use valid invitation', 'Use different email domain'],
      examples: ['Registration only available during business hours']
    });

    this.registerError({
      moduleCode: ModuleCode.USER,
      operationCode: OperationCode.REFRESH,
      errorLevelCode: ErrorLevelCode.TOKEN_ERROR,
      title: 'Token Refresh Failed',
      description: 'Unable to refresh authentication token',
      commonCauses: ['Token expired', 'Invalid token', 'Token revoked'],
      solutions: ['Login again', 'Use valid token', 'Request new token'],
      examples: ['Refresh token expired after 30 days']
    });

    // Permission Module Errors
    this.registerError({
      moduleCode: ModuleCode.PERMISSION,
      operationCode: OperationCode.CREATE,
      errorLevelCode: ErrorLevelCode.CONFLICT,
      title: 'Permission Already Exists',
      description: 'Permission with same name and resource already exists',
      commonCauses: ['Duplicate permission name', 'Same resource-action combination'],
      solutions: ['Use different permission name', 'Modify existing permission'],
      examples: ['Permission "users:create" already exists']
    });

    this.registerError({
      moduleCode: ModuleCode.PERMISSION,
      operationCode: OperationCode.READ,
      errorLevelCode: ErrorLevelCode.NOT_FOUND,
      title: 'Permission Not Found',
      description: 'Permission with specified ID does not exist',
      commonCauses: ['Invalid permission ID', 'Permission was deleted'],
      solutions: ['Verify permission ID', 'Check if permission exists'],
      examples: ['Permission ID: "perm_123" not found']
    });

    this.registerError({
      moduleCode: ModuleCode.PERMISSION,
      operationCode: OperationCode.DELETE,
      errorLevelCode: ErrorLevelCode.BUSINESS_LOGIC_ERROR,
      title: 'Permission Deletion Not Allowed',
      description: 'Permission cannot be deleted due to dependencies',
      commonCauses: ['Permission assigned to roles', 'System permission'],
      solutions: ['Remove from roles first', 'Cannot delete system permissions'],
      examples: ['Cannot delete permission assigned to ADMIN role']
    });

    // Translation Module Errors
    this.registerError({
      moduleCode: ModuleCode.TRANSLATION,
      operationCode: OperationCode.READ,
      errorLevelCode: ErrorLevelCode.NOT_FOUND,
      title: 'Translation Not Found',
      description: 'Translation for specified key and locale not found',
      commonCauses: ['Invalid translation key', 'Unsupported locale'],
      solutions: ['Use valid translation key', 'Use supported locale'],
      examples: ['Key: "welcome.message" not found for locale "fr"']
    });

    // Auth Module Errors
    this.registerError({
      moduleCode: ModuleCode.AUTH,
      operationCode: OperationCode.READ,
      errorLevelCode: ErrorLevelCode.AUTHORIZATION,
      title: 'Authentication Required',
      description: 'Endpoint requires authentication',
      commonCauses: ['Missing token', 'Invalid token', 'Token expired'],
      solutions: ['Provide valid token', 'Login again', 'Refresh token'],
      examples: ['Authorization header missing']
    });

    this.registerError({
      moduleCode: ModuleCode.AUTH,
      operationCode: OperationCode.READ,
      errorLevelCode: ErrorLevelCode.FORBIDDEN,
      title: 'Insufficient Permissions',
      description: 'User does not have required permissions',
      commonCauses: ['Missing role', 'Insufficient privileges'],
      solutions: ['Request appropriate role', 'Contact administrator'],
      examples: ['User role required: ADMIN, current: USER']
    });
  }

  /**
   * Register a new error code
   */
  private registerError(entry: Omit<ErrorRegistryEntry, 'code' | 'httpStatus' | 'trpcCode' | 'createdAt' | 'updatedAt'>): void {
    const code = ErrorCodeGenerator.generate(
      entry.moduleCode,
      entry.operationCode,
      entry.errorLevelCode
    );

    const fullEntry: ErrorRegistryEntry = {
      ...entry,
      code,
      httpStatus: this.getHttpStatus(entry.errorLevelCode),
      trpcCode: this.getTRPCCode(entry.errorLevelCode),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.registry.set(code, fullEntry);
  }

  /**
   * Get error entry by code
   */
  public getError(code: string): ErrorRegistryEntry | undefined {
    return this.registry.get(code);
  }

  /**
   * Get all errors for a module
   */
  public getErrorsByModule(moduleCode: ModuleCode): ErrorRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      entry => entry.moduleCode === moduleCode
    );
  }

  /**
   * Get all errors for an operation
   */
  public getErrorsByOperation(operationCode: OperationCode): ErrorRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      entry => entry.operationCode === operationCode
    );
  }

  /**
   * Get all errors by error level
   */
  public getErrorsByLevel(errorLevelCode: ErrorLevelCode): ErrorRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      entry => entry.errorLevelCode === errorLevelCode
    );
  }

  /**
   * Get all registered errors
   */
  public getAllErrors(): ErrorRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Search errors by title or description
   */
  public searchErrors(query: string): ErrorRegistryEntry[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.registry.values()).filter(
      entry => 
        entry.title.toLowerCase().includes(lowercaseQuery) ||
        entry.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Validate if error code exists
   */
  public validateErrorCode(code: string): boolean {
    return this.registry.has(code);
  }

  /**
   * Get error statistics
   */
  public getStatistics(): {
    totalErrors: number;
    errorsByModule: Record<string, number>;
    errorsByOperation: Record<string, number>;
    errorsByLevel: Record<string, number>;
  } {
    const errors = this.getAllErrors();
    
    return {
      totalErrors: errors.length,
      errorsByModule: this.groupByField(errors, 'moduleCode'),
      errorsByOperation: this.groupByField(errors, 'operationCode'),
      errorsByLevel: this.groupByField(errors, 'errorLevelCode')
    };
  }

  /**
   * Generate error documentation
   */
  public generateDocumentation(): string {
    const errors = this.getAllErrors();
    let doc = '# Error Code Documentation\n\n';
    
    // Group by module
    const moduleGroups = this.groupErrors(errors, 'moduleCode');
    
    Object.entries(moduleGroups).forEach(([moduleCode, moduleErrors]) => {
      doc += `## ${this.getModuleName(Number(moduleCode))} Module\n\n`;
      
      moduleErrors.forEach(error => {
        doc += `### ${error.code} - ${error.title}\n\n`;
        doc += `**Description:** ${error.description}\n\n`;
        doc += `**HTTP Status:** ${error.httpStatus}\n\n`;
        doc += `**tRPC Code:** ${error.trpcCode}\n\n`;
        
        if (error.commonCauses?.length) {
          doc += `**Common Causes:**\n`;
          error.commonCauses.forEach(cause => doc += `- ${cause}\n`);
          doc += '\n';
        }
        
        if (error.solutions?.length) {
          doc += `**Solutions:**\n`;
          error.solutions.forEach(solution => doc += `- ${solution}\n`);
          doc += '\n';
        }
        
        if (error.examples?.length) {
          doc += `**Examples:**\n`;
          error.examples.forEach(example => doc += `- ${example}\n`);
          doc += '\n';
        }
        
        doc += '---\n\n';
      });
    });
    
    return doc;
  }

  /**
   * Helper methods
   */
  private groupByField(errors: ErrorRegistryEntry[], field: keyof ErrorRegistryEntry): Record<string, number> {
    return errors.reduce((acc, error) => {
      const key = String(error[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupErrors(errors: ErrorRegistryEntry[], field: keyof ErrorRegistryEntry): Record<string, ErrorRegistryEntry[]> {
    return errors.reduce((acc, error) => {
      const key = String(error[field]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(error);
      return acc;
    }, {} as Record<string, ErrorRegistryEntry[]>);
  }

  private getHttpStatus(errorLevelCode: ErrorLevelCode): number {
    const statusMap = {
      [ErrorLevelCode.VALIDATION]: 400,
      [ErrorLevelCode.AUTHORIZATION]: 401,
      [ErrorLevelCode.FORBIDDEN]: 403,
      [ErrorLevelCode.NOT_FOUND]: 404,
      [ErrorLevelCode.CONFLICT]: 409,
      [ErrorLevelCode.RATE_LIMIT]: 429,
      [ErrorLevelCode.SERVER_ERROR]: 500,
      [ErrorLevelCode.DATABASE_ERROR]: 500,
      [ErrorLevelCode.NETWORK_ERROR]: 502,
      [ErrorLevelCode.TIMEOUT_ERROR]: 504,
      [ErrorLevelCode.EXTERNAL_API_ERROR]: 502,
      [ErrorLevelCode.PAYMENT_ERROR]: 402,
      [ErrorLevelCode.EMAIL_ERROR]: 500,
      [ErrorLevelCode.SMS_ERROR]: 500,
      [ErrorLevelCode.STORAGE_ERROR]: 500,
      [ErrorLevelCode.BUSINESS_LOGIC_ERROR]: 400,
      [ErrorLevelCode.SUBSCRIPTION_ERROR]: 400,
      [ErrorLevelCode.INVENTORY_ERROR]: 409,
      [ErrorLevelCode.PRICING_ERROR]: 400,
      [ErrorLevelCode.SECURITY_ERROR]: 403,
      [ErrorLevelCode.AUTHENTICATION_ERROR]: 401,
      [ErrorLevelCode.TOKEN_ERROR]: 401,
      [ErrorLevelCode.ENCRYPTION_ERROR]: 500,
      [ErrorLevelCode.CONFIG_ERROR]: 500,
      [ErrorLevelCode.ENVIRONMENT_ERROR]: 500,
      [ErrorLevelCode.DEPENDENCY_ERROR]: 500,
    };

    return statusMap[errorLevelCode] || 500;
  }

  private getTRPCCode(errorLevelCode: ErrorLevelCode): string {
    const trpcCodeMap = {
      [ErrorLevelCode.VALIDATION]: 'BAD_REQUEST',
      [ErrorLevelCode.AUTHORIZATION]: 'UNAUTHORIZED',
      [ErrorLevelCode.FORBIDDEN]: 'FORBIDDEN',
      [ErrorLevelCode.NOT_FOUND]: 'NOT_FOUND',
      [ErrorLevelCode.CONFLICT]: 'CONFLICT',
      [ErrorLevelCode.RATE_LIMIT]: 'TOO_MANY_REQUESTS',
      [ErrorLevelCode.SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.DATABASE_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.NETWORK_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.TIMEOUT_ERROR]: 'TIMEOUT',
      [ErrorLevelCode.EXTERNAL_API_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.PAYMENT_ERROR]: 'PAYMENT_REQUIRED',
      [ErrorLevelCode.EMAIL_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.SMS_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.STORAGE_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.BUSINESS_LOGIC_ERROR]: 'BAD_REQUEST',
      [ErrorLevelCode.SUBSCRIPTION_ERROR]: 'BAD_REQUEST',
      [ErrorLevelCode.INVENTORY_ERROR]: 'CONFLICT',
      [ErrorLevelCode.PRICING_ERROR]: 'BAD_REQUEST',
      [ErrorLevelCode.SECURITY_ERROR]: 'FORBIDDEN',
      [ErrorLevelCode.AUTHENTICATION_ERROR]: 'UNAUTHORIZED',
      [ErrorLevelCode.TOKEN_ERROR]: 'UNAUTHORIZED',
      [ErrorLevelCode.ENCRYPTION_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.CONFIG_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.ENVIRONMENT_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ErrorLevelCode.DEPENDENCY_ERROR]: 'INTERNAL_SERVER_ERROR',
    };

    return trpcCodeMap[errorLevelCode] || 'INTERNAL_SERVER_ERROR';
  }

  private getModuleName(moduleCode: ModuleCode): string {
    const moduleNames = {
      // Core System (10-19)
      [ModuleCode.USER]: 'User',
      [ModuleCode.AUTH]: 'Authentication',
      [ModuleCode.PERMISSION]: 'Permission',
      [ModuleCode.TRANSLATION]: 'Translation',
      
      // E-commerce (20-29)
      [ModuleCode.PRODUCT]: 'Product',
      [ModuleCode.CATEGORY]: 'Category',
      [ModuleCode.CART]: 'Cart',
      [ModuleCode.ORDER]: 'Order',
      [ModuleCode.INVENTORY]: 'Inventory',
      
      // Content Management (30-39)
      [ModuleCode.NEWS]: 'News',
      [ModuleCode.ARTICLE]: 'Article',
      [ModuleCode.COMMENT]: 'Comment',
      [ModuleCode.TAG]: 'Tag',
      
      // Subscription & Billing (40-49)
      [ModuleCode.SUBSCRIPTION]: 'Subscription',
      [ModuleCode.PLAN]: 'Plan',
      [ModuleCode.BILLING]: 'Billing',
      [ModuleCode.INVOICE]: 'Invoice',
      
      // Payment System (50-59)
      [ModuleCode.PAYMENT]: 'Payment',
      [ModuleCode.GATEWAY]: 'Gateway',
      [ModuleCode.TRANSACTION]: 'Transaction',
      [ModuleCode.REFUND]: 'Refund',
      
      // Communication (60-69)
      [ModuleCode.NOTIFICATION]: 'Notification',
      [ModuleCode.EMAIL]: 'Email',
      [ModuleCode.SMS]: 'SMS',
      
      // File & Media (70-79)
      [ModuleCode.FILE]: 'File',
      [ModuleCode.MEDIA]: 'Media',
      [ModuleCode.UPLOAD]: 'Upload',
      
      // Analytics & Reporting (80-89)
      [ModuleCode.ANALYTICS]: 'Analytics',
      [ModuleCode.REPORT]: 'Report',
      [ModuleCode.DASHBOARD]: 'Dashboard',
      
      // System Management (90-99)
      [ModuleCode.SYSTEM]: 'System',
      [ModuleCode.CONFIG]: 'Configuration',
      [ModuleCode.AUDIT]: 'Audit',
    };

    return moduleNames[moduleCode] || 'Unknown';
  }
}

// Export singleton instance
export const errorRegistry = ErrorRegistry.getInstance(); 