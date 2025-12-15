/**
 * Worker Service Payloads
 * These interfaces define the structure of messages processed by worker queues
 */
import { ExportJobPayload } from '../../export/interfaces/export-payload.interface';
import { ExportFormat } from '../../export/entities/data-export-job.entity';

// Email Payloads
export interface EmailPayload {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  providerId?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
  triggeredBy?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  details?: Record<string, unknown>;
}

// Notification Payloads
export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system' | 'order' | 'product' | 'user';
  data?: Record<string, unknown>;
  channels?: Array<'push' | 'email' | 'sms' | 'in_app'>;
  actionUrl?: string;
  icon?: string;
  image?: string;
  fcmTokens?: string[];
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  channels: {
    push?: { success: boolean; error?: string };
    email?: { success: boolean; error?: string };
    sms?: { success: boolean; error?: string };
    in_app?: { success: boolean; error?: string };
  };
}

// Order Payloads
export interface OrderPayload {
  orderId: string;
  action: 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  userId: string;
  orderData?: {
    totalAmount?: number;
    currency?: string;
    items?: Array<{
      productId: string;
      productName?: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: {
      fullName?: string;
      phone?: string;
      address?: string;
      city?: string;
      district?: string;
      ward?: string;
      country?: string;
    };
    trackingNumber?: string;
    trackingUrl?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  };
  notifyUser?: boolean;
  sendEmail?: boolean;
}

export interface OrderResult {
  success: boolean;
  orderId: string;
  action: string;
  notificationSent?: boolean;
  emailSent?: boolean;
  loyaltyPointsUpdated?: boolean;
  inventoryUpdated?: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

// Report Payloads
export interface ReportPayload {
  reportId: string;
  type: 'sales' | 'inventory' | 'users' | 'orders' | 'analytics' | 'custom';
  userId: string;
  parameters?: {
    startDate?: string;
    endDate?: string;
    filters?: Record<string, unknown>;
    format?: 'pdf' | 'csv' | 'xlsx' | 'json';
    groupBy?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  deliveryMethod?: 'email' | 'download' | 'storage';
  emailTo?: string;
  storageKey?: string;
}

export interface ReportResult {
  success: boolean;
  reportId: string;
  type: string;
  fileUrl?: string;
  filePath?: string;
  fileSize?: number;
  format?: string;
  deliveryMethod?: string;
  deliveredTo?: string;
  error?: string;
  generatedAt?: Date;
}

// Export payloads
export type ExportPayload = ExportJobPayload;

export interface ExportResult {
  jobId: string;
  success: boolean;
  resource: string;
  format: ExportFormat;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  totalRecords?: number;
  error?: string;
}

// Queue Message Wrapper
export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
  retryCount?: number;
  maxRetries?: number;
  priority?: number;
  scheduledAt?: Date;
}

// Constants
export const QUEUE_NAMES = {
  EMAIL: 'email_queue',
  NOTIFICATION: 'notification_queue',
  ORDER: 'order_queue',
  REPORT: 'report_queue',
  EXPORT: 'export_queue',
} as const;

export const MESSAGE_TYPES = {
  // Email types
  EMAIL_SEND: 'email:send',
  EMAIL_BULK: 'email:bulk',
  EMAIL_TEMPLATE: 'email:template',
  EMAIL_TRANSACTIONAL: 'email:transactional',

  // Notification types
  NOTIFICATION_PUSH: 'notification:push',
  NOTIFICATION_SMS: 'notification:sms',
  NOTIFICATION_IN_APP: 'notification:in_app',
  NOTIFICATION_BULK: 'notification:bulk',

  // Order types
  ORDER_CREATED: 'order:created',
  ORDER_CONFIRMED: 'order:confirmed',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_REFUNDED: 'order:refunded',

  // Report types
  REPORT_GENERATE: 'report:generate',
  REPORT_SALES: 'report:sales',
  REPORT_INVENTORY: 'report:inventory',
  REPORT_USERS: 'report:users',
  REPORT_ANALYTICS: 'report:analytics',

  // Export types
  EXPORT_GENERATE: 'export:generate',
} as const;
