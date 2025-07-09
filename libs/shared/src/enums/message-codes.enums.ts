/**
 * Message Code System for Success/Info Messages
 * 
 * Formula: XXYYZZ (same as error codes)
 * - XX: Module Code (10-99) - same as error codes
 * - YY: Operation Code (01-99) - same as error codes
 * - ZZ: Message Level Code (01-99) - different from error codes
 * 
 * Example: 200101 = Product (20) + Create (01) + Success (01)
 */

import { ModuleCode, OperationCode } from './error-codes.enums';

/**
 * Message Level Codes (ZZ) - Range: 01-99
 * Defines the type of success/info message
 */
export enum MessageLevelCode {
  // Success Messages (01-09)
  SUCCESS = 1,            // General success
  CREATED = 2,            // Resource created successfully
  UPDATED = 3,            // Resource updated successfully
  DELETED = 4,            // Resource deleted successfully
  PROCESSED = 5,          // Operation processed successfully
  COMPLETED = 6,          // Operation completed successfully
  SENT = 7,               // Message/notification sent successfully
  RECEIVED = 8,           // Data received successfully
  SYNCHRONIZED = 9,       // Data synchronized successfully
  
  // Info Messages (10-19)
  INFO = 10,              // General information
  WARNING = 11,           // Warning message
  NOTIFICATION = 12,      // General notification
  REMINDER = 13,          // Reminder message
  CONFIRMATION = 14,      // Confirmation message
  PROGRESS = 15,          // Progress update
  STATUS_CHANGE = 16,     // Status change notification
  MAINTENANCE = 17,       // Maintenance notification
  
  // Process Messages (20-29)
  PENDING = 20,           // Operation pending
  IN_PROGRESS = 21,       // Operation in progress
  QUEUED = 22,            // Operation queued
  SCHEDULED = 23,         // Operation scheduled
  RETRY = 24,             // Operation will be retried
  CANCELLED = 25,         // Operation cancelled
  PAUSED = 26,            // Operation paused
  RESUMED = 27,           // Operation resumed
  
  // Authentication Messages (30-39)
  LOGGED_IN = 30,         // User logged in successfully
  LOGGED_OUT = 31,        // User logged out successfully
  REGISTERED = 32,        // User registered successfully
  VERIFIED = 33,          // User/email verified successfully
  PASSWORD_RESET = 34,    // Password reset successfully
  TOKEN_REFRESHED = 35,   // Token refreshed successfully
  
  // Business Logic Messages (40-49)
  APPROVED = 40,          // Entity approved
  REJECTED = 41,          // Entity rejected
  PUBLISHED = 42,         // Content published
  ARCHIVED = 43,          // Content archived
  ACTIVATED = 44,         // Entity activated
  DEACTIVATED = 45,       // Entity deactivated
  
  // Payment Messages (50-59)
  PAYMENT_SUCCESS = 50,   // Payment successful
  REFUND_PROCESSED = 51,  // Refund processed
  INVOICE_GENERATED = 52, // Invoice generated
  SUBSCRIPTION_ACTIVE = 53, // Subscription activated
  SUBSCRIPTION_EXPIRED = 54, // Subscription expired
  
  // System Messages (60-69)
  SYSTEM_HEALTHY = 60,    // System health check passed
  BACKUP_COMPLETED = 61,  // Backup completed
  RESTORE_COMPLETED = 62, // Restore completed
  MIGRATION_COMPLETED = 63, // Migration completed
  SYNC_COMPLETED = 64,    // Synchronization completed
  
  // Email/SMS Messages (70-79)
  EMAIL_SENT = 70,        // Email sent successfully
  SMS_SENT = 71,          // SMS sent successfully
  NOTIFICATION_SENT = 72, // Notification sent successfully
  
  // File/Upload Messages (80-89)
  FILE_UPLOADED = 80,     // File uploaded successfully
  FILE_DELETED = 81,      // File deleted successfully
  FILE_PROCESSED = 82,    // File processed successfully
  EXPORT_COMPLETED = 83,  // Export completed
  IMPORT_COMPLETED = 84,  // Import completed
}

/**
 * Message Code Generator Utility
 * Generates standardized message codes using the XXYYZZ format
 */
export class MessageCodeGenerator {
  /**
   * Generate message code using XXYYZZ format
   * @param moduleCode - Module where message occurred
   * @param operationCode - Operation being performed
   * @param messageLevelCode - Type of message
   * @returns Formatted message code as string
   */
  static generate(
    moduleCode: ModuleCode,
    operationCode: OperationCode,
    messageLevelCode: MessageLevelCode
  ): string {
    const module = moduleCode.toString().padStart(2, '0');
    const operation = operationCode.toString().padStart(2, '0');
    const messageLevel = messageLevelCode.toString().padStart(2, '0');
    
    return `${module}${operation}${messageLevel}`;
  }

  /**
   * Parse message code back to its components
   * @param messageCode - 6-digit message code
   * @returns Object with module, operation, and message level codes
   */
  static parse(messageCode: string): {
    moduleCode: number;
    operationCode: number;
    messageLevelCode: number;
  } {
    if (messageCode.length !== 6) {
      throw new Error('Message code must be exactly 6 digits');
    }

    return {
      moduleCode: parseInt(messageCode.substring(0, 2)),
      operationCode: parseInt(messageCode.substring(2, 4)),
      messageLevelCode: parseInt(messageCode.substring(4, 6))
    };
  }
}

/**
 * Common Message Code Combinations
 * Pre-defined message codes for frequently used scenarios
 */
export const CommonMessageCodes = {
  // User Module Messages
  USER_CREATED: MessageCodeGenerator.generate(ModuleCode.USER, OperationCode.CREATE, MessageLevelCode.CREATED),
  USER_UPDATED: MessageCodeGenerator.generate(ModuleCode.USER, OperationCode.UPDATE, MessageLevelCode.UPDATED),
  USER_DELETED: MessageCodeGenerator.generate(ModuleCode.USER, OperationCode.DELETE, MessageLevelCode.DELETED),
  USER_ACTIVATED: MessageCodeGenerator.generate(ModuleCode.USER, OperationCode.ACTIVATE, MessageLevelCode.ACTIVATED),
  
  // Auth Module Messages
  LOGIN_SUCCESS: MessageCodeGenerator.generate(ModuleCode.AUTH, OperationCode.LOGIN, MessageLevelCode.LOGGED_IN),
  LOGOUT_SUCCESS: MessageCodeGenerator.generate(ModuleCode.AUTH, OperationCode.LOGOUT, MessageLevelCode.LOGGED_OUT),
  REGISTER_SUCCESS: MessageCodeGenerator.generate(ModuleCode.AUTH, OperationCode.REGISTER, MessageLevelCode.REGISTERED),
  TOKEN_REFRESHED: MessageCodeGenerator.generate(ModuleCode.AUTH, OperationCode.REFRESH, MessageLevelCode.TOKEN_REFRESHED),
  EMAIL_VERIFIED: MessageCodeGenerator.generate(ModuleCode.AUTH, OperationCode.VERIFY, MessageLevelCode.VERIFIED),
  
  // Product Module Messages
  PRODUCT_CREATED: MessageCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.CREATE, MessageLevelCode.CREATED),
  PRODUCT_UPDATED: MessageCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.UPDATE, MessageLevelCode.UPDATED),
  PRODUCT_DELETED: MessageCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.DELETE, MessageLevelCode.DELETED),
  PRODUCT_PUBLISHED: MessageCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.PUBLISH, MessageLevelCode.PUBLISHED),
  
  // Order Module Messages
  ORDER_CREATED: MessageCodeGenerator.generate(ModuleCode.ORDER, OperationCode.CREATE, MessageLevelCode.CREATED),
  ORDER_UPDATED: MessageCodeGenerator.generate(ModuleCode.ORDER, OperationCode.UPDATE, MessageLevelCode.UPDATED),
  ORDER_PROCESSED: MessageCodeGenerator.generate(ModuleCode.ORDER, OperationCode.PROCESS, MessageLevelCode.PROCESSED),
  ORDER_CANCELLED: MessageCodeGenerator.generate(ModuleCode.ORDER, OperationCode.CANCEL, MessageLevelCode.CANCELLED),
  
  // Payment Module Messages
  PAYMENT_SUCCESS: MessageCodeGenerator.generate(ModuleCode.PAYMENT, OperationCode.PROCESS, MessageLevelCode.PAYMENT_SUCCESS),
  REFUND_PROCESSED: MessageCodeGenerator.generate(ModuleCode.REFUND, OperationCode.PROCESS, MessageLevelCode.REFUND_PROCESSED),
  
  // Subscription Module Messages
  SUBSCRIPTION_CREATED: MessageCodeGenerator.generate(ModuleCode.SUBSCRIPTION, OperationCode.CREATE, MessageLevelCode.CREATED),
  SUBSCRIPTION_ACTIVATED: MessageCodeGenerator.generate(ModuleCode.SUBSCRIPTION, OperationCode.ACTIVATE, MessageLevelCode.SUBSCRIPTION_ACTIVE),
  SUBSCRIPTION_CANCELLED: MessageCodeGenerator.generate(ModuleCode.SUBSCRIPTION, OperationCode.CANCEL, MessageLevelCode.CANCELLED),
  
  // News Module Messages
  ARTICLE_PUBLISHED: MessageCodeGenerator.generate(ModuleCode.ARTICLE, OperationCode.PUBLISH, MessageLevelCode.PUBLISHED),
  ARTICLE_ARCHIVED: MessageCodeGenerator.generate(ModuleCode.ARTICLE, OperationCode.ARCHIVE, MessageLevelCode.ARCHIVED),
  COMMENT_APPROVED: MessageCodeGenerator.generate(ModuleCode.COMMENT, OperationCode.APPROVE, MessageLevelCode.APPROVED),
  
  // File Module Messages
  FILE_UPLOADED: MessageCodeGenerator.generate(ModuleCode.FILE, OperationCode.UPLOAD, MessageLevelCode.FILE_UPLOADED),
  FILE_DELETED: MessageCodeGenerator.generate(ModuleCode.FILE, OperationCode.DELETE, MessageLevelCode.FILE_DELETED),
  EXPORT_COMPLETED: MessageCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.EXPORT, MessageLevelCode.EXPORT_COMPLETED),
  IMPORT_COMPLETED: MessageCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.IMPORT, MessageLevelCode.IMPORT_COMPLETED),
  
  // System Messages
  SYSTEM_HEALTHY: MessageCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.PROCESS, MessageLevelCode.SYSTEM_HEALTHY),
  BACKUP_COMPLETED: MessageCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.BACKUP, MessageLevelCode.BACKUP_COMPLETED),
  SYNC_COMPLETED: MessageCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.SYNC, MessageLevelCode.SYNC_COMPLETED),
  
  // Email/Notification Messages
  EMAIL_SENT: MessageCodeGenerator.generate(ModuleCode.EMAIL, OperationCode.SEND, MessageLevelCode.EMAIL_SENT),
  SMS_SENT: MessageCodeGenerator.generate(ModuleCode.SMS, OperationCode.SEND, MessageLevelCode.SMS_SENT),
  NOTIFICATION_SENT: MessageCodeGenerator.generate(ModuleCode.NOTIFICATION, OperationCode.SEND, MessageLevelCode.NOTIFICATION_SENT),
} as const; 