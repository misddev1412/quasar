/**
 * Error Code System for SaaS Platform
 * 
 * Formula: XXYYZZ
 * - XX: Module Code (10-99)
 * - YY: Operation Code (01-99) 
 * - ZZ: Error Level Code (01-99)
 * 
 * Example: 201001 = Product (20) + Create (01) + Validation Error (01)
 */

/**
 * Module Codes (XX) - Range: 10-99
 * Defines which module/domain the error belongs to
 */
export enum ModuleCode {
  // Core System (10-19)
  USER = 10,              // User Management
  AUTH = 11,              // Authentication System
  PERMISSION = 12,        // Permission & Role Management
  TRANSLATION = 13,       // Translation/i18n System
  SEO = 14,               // SEO Management System
  SETTINGS = 15,          // Settings Management System
  
  // E-commerce (20-29)
  PRODUCT = 20,           // Product Management
  CATEGORY = 21,          // Category Management
  CART = 22,              // Shopping Cart
  ORDER = 23,             // Order Management
  INVENTORY = 24,         // Inventory Management
  ADDRESS_BOOK = 25,      // Address Book Management
  
  // Content Management (30-39)
  NEWS = 30,              // News System
  ARTICLE = 31,           // Article Management
  COMMENT = 32,           // Comment System
  TAG = 33,               // Tag Management
  
  // Subscription & Billing (40-49)
  SUBSCRIPTION = 40,      // Subscription Management
  PLAN = 41,              // Plan Management
  BILLING = 42,           // Billing System
  INVOICE = 43,           // Invoice Management
  
  // Payment System (50-59)
  PAYMENT = 50,           // Payment Processing
  GATEWAY = 51,           // Payment Gateway Integration
  TRANSACTION = 52,       // Transaction Management
  REFUND = 53,            // Refund Processing
  
  // Communication (60-69)
  NOTIFICATION = 60,      // Notification System
  EMAIL = 61,             // Email Service
  EMAIL_CHANNEL = 62,     // Email Channel Management
  SMS = 63,               // SMS Service
  
  // File & Media (70-79)
  FILE = 70,              // File Management
  MEDIA = 71,             // Media Processing
  UPLOAD = 72,            // Upload Service
  
  // Analytics & Reporting (80-89)
  ANALYTICS = 80,         // Analytics Engine
  REPORT = 81,            // Report Generation
  DASHBOARD = 82,         // Dashboard System
  
  // System Management (90-99)
  SYSTEM = 90,            // System Configuration
  CONFIG = 91,            // Application Config
  AUDIT = 92,             // Audit Logging
}

/**
 * Operation Codes (YY) - Range: 01-99
 * Defines what operation was being performed when the error occurred
 */
export enum OperationCode {
  // Basic CRUD Operations (01-09)
  CREATE = 1,             // Create/Add new entity
  READ = 2,               // Read/Get/Fetch entity
  UPDATE = 3,             // Update/Edit entity
  DELETE = 4,             // Delete/Remove entity
  
  // Authentication Operations (05-09)
  LOGIN = 5,              // User login
  REGISTER = 6,           // User registration
  LOGOUT = 7,             // User logout
  REFRESH = 8,            // Token refresh
  VERIFY = 9,             // Verification (email, phone, etc.)
  
  // Status Operations (10-19)
  ACTIVATE = 10,          // Activate entity
  DEACTIVATE = 11,        // Deactivate entity
  APPROVE = 12,           // Approve entity
  REJECT = 13,            // Reject entity
  PUBLISH = 14,           // Publish content
  ARCHIVE = 15,           // Archive entity
  RESTORE = 16,           // Restore entity
  
  // Data Operations (17-29)
  SEARCH = 17,            // Search operation
  FILTER = 18,            // Filter operation
  SORT = 19,              // Sort operation
  EXPORT = 20,            // Export data
  IMPORT = 21,            // Import data
  
  // Subscription Operations (22-29)
  SUBSCRIBE = 22,         // Subscribe to service
  UNSUBSCRIBE = 23,       // Unsubscribe from service
  
  // Commerce Operations (24-29)
  PURCHASE = 24,          // Purchase operation
  REFUND = 25,            // Refund operation
  CANCEL = 26,            // Cancel operation
  
  // Processing Operations (27-35)
  PROCESS = 27,           // Process operation
  VALIDATE = 28,          // Validate operation
  SEND = 29,              // Send operation
  RECEIVE = 30,           // Receive operation
  
  // File Operations (31-35)
  UPLOAD = 31,            // Upload file
  DOWNLOAD = 32,          // Download file
  BACKUP = 33,            // Backup operation
  RESTORE_DATA = 34,      // Restore data operation
  SYNC = 35,              // Synchronization operation
}

/**
 * Error Level Codes (ZZ) - Range: 01-99
 * Defines the type/severity of the error
 */
export enum ErrorLevelCode {
  // Client Errors (01-09)
  VALIDATION = 1,         // Validation error (400)
  AUTHORIZATION = 2,      // Authorization error (401)
  FORBIDDEN = 3,          // Forbidden access (403)
  NOT_FOUND = 4,          // Resource not found (404)
  CONFLICT = 5,           // Resource conflict (409)
  RATE_LIMIT = 6,         // Rate limit exceeded (429)
  
  // Server Errors (10-19)
  SERVER_ERROR = 10,      // Internal server error (500)
  DATABASE_ERROR = 11,    // Database operation error
  NETWORK_ERROR = 12,     // Network connectivity error
  TIMEOUT_ERROR = 13,     // Operation timeout
  
  // External Service Errors (20-29)
  EXTERNAL_API_ERROR = 20,    // External API error
  PAYMENT_ERROR = 21,         // Payment processing error
  EMAIL_ERROR = 22,           // Email service error
  SMS_ERROR = 23,             // SMS service error
  STORAGE_ERROR = 24,         // File/Media storage error
  
  // Business Logic Errors (30-39)
  BUSINESS_LOGIC_ERROR = 30,  // Business rule violation
  SUBSCRIPTION_ERROR = 31,    // Subscription-related error
  INVENTORY_ERROR = 32,       // Inventory-related error
  PRICING_ERROR = 33,         // Pricing calculation error
  
  // Security Errors (40-49)
  SECURITY_ERROR = 40,        // Security violation
  AUTHENTICATION_ERROR = 41,  // Authentication failure
  TOKEN_ERROR = 42,           // Token-related error
  ENCRYPTION_ERROR = 43,      // Encryption/Decryption error
  
  // Configuration Errors (50-59)
  CONFIG_ERROR = 50,          // Configuration error
  ENVIRONMENT_ERROR = 51,     // Environment setup error
  DEPENDENCY_ERROR = 52,      // Dependency missing/error
}

/**
 * Error Code Generator Utility
 * Generates standardized error codes using the XXYYZZ format
 */
export class ErrorCodeGenerator {
  /**
   * Generate error code using XXYYZZ format
   * @param moduleCode - Module where error occurred
   * @param operationCode - Operation being performed
   * @param errorLevelCode - Type of error
   * @returns Formatted error code as string
   */
  static generate(
    moduleCode: ModuleCode,
    operationCode: OperationCode,
    errorLevelCode: ErrorLevelCode
  ): string {
    const module = moduleCode.toString().padStart(2, '0');
    const operation = operationCode.toString().padStart(2, '0');
    const errorLevel = errorLevelCode.toString().padStart(2, '0');
    
    return `${module}${operation}${errorLevel}`;
  }

  /**
   * Parse error code back to its components
   * @param errorCode - 6-digit error code
   * @returns Object with module, operation, and error level codes
   */
  static parse(errorCode: string): {
    moduleCode: number;
    operationCode: number;
    errorLevelCode: number;
  } {
    if (errorCode.length !== 6) {
      throw new Error('Error code must be exactly 6 digits');
    }

    return {
      moduleCode: parseInt(errorCode.substring(0, 2)),
      operationCode: parseInt(errorCode.substring(2, 4)),
      errorLevelCode: parseInt(errorCode.substring(4, 6))
    };
  }
}

/**
 * Common Error Code Combinations
 * Pre-defined error codes for frequently used scenarios
 */
export const CommonErrorCodes = {
  // User Module Errors
  USER_NOT_FOUND: ErrorCodeGenerator.generate(ModuleCode.USER, OperationCode.READ, ErrorLevelCode.NOT_FOUND),
  USER_VALIDATION_ERROR: ErrorCodeGenerator.generate(ModuleCode.USER, OperationCode.CREATE, ErrorLevelCode.VALIDATION),
  USER_UNAUTHORIZED: ErrorCodeGenerator.generate(ModuleCode.USER, OperationCode.READ, ErrorLevelCode.AUTHORIZATION),
  
  // Auth Module Errors
  LOGIN_FAILED: ErrorCodeGenerator.generate(ModuleCode.AUTH, OperationCode.LOGIN, ErrorLevelCode.AUTHENTICATION_ERROR),
  REGISTER_CONFLICT: ErrorCodeGenerator.generate(ModuleCode.AUTH, OperationCode.REGISTER, ErrorLevelCode.CONFLICT),
  TOKEN_EXPIRED: ErrorCodeGenerator.generate(ModuleCode.AUTH, OperationCode.REFRESH, ErrorLevelCode.TOKEN_ERROR),
  
  // Product Module Errors
  PRODUCT_NOT_FOUND: ErrorCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.READ, ErrorLevelCode.NOT_FOUND),
  PRODUCT_OUT_OF_STOCK: ErrorCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.PURCHASE, ErrorLevelCode.INVENTORY_ERROR),
  
  // Payment Module Errors
  PAYMENT_FAILED: ErrorCodeGenerator.generate(ModuleCode.PAYMENT, OperationCode.PROCESS, ErrorLevelCode.PAYMENT_ERROR),
  PAYMENT_GATEWAY_ERROR: ErrorCodeGenerator.generate(ModuleCode.GATEWAY, OperationCode.PROCESS, ErrorLevelCode.EXTERNAL_API_ERROR),
  
  // System Errors
  INTERNAL_ERROR: ErrorCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.PROCESS, ErrorLevelCode.SERVER_ERROR),
  DATABASE_CONNECTION_ERROR: ErrorCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.PROCESS, ErrorLevelCode.DATABASE_ERROR),
} as const; 