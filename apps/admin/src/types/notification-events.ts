import type { NotificationChannel } from '../hooks/useNotificationPreferences';

export type NotificationEventKey =
  | 'custom.manual'
  | 'user.registered'
  | 'user.verified'
  | 'order.created'
  | 'order.confirmed'
  | 'order.shipped'
  | 'order.delivered'
  | 'order.cancelled'
  | 'order.refunded'
  | 'system.announcement'
  | 'marketing.campaign'
  | 'export.completed'
  | 'export.failed';

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEventKey, string> = {
  'custom.manual': 'Custom / Manual',
  'user.registered': 'User Registered',
  'user.verified': 'User Verified',
  'order.created': 'Order Created',
  'order.confirmed': 'Order Confirmed',
  'order.shipped': 'Order Shipped',
  'order.delivered': 'Order Delivered',
  'order.cancelled': 'Order Cancelled',
  'order.refunded': 'Order Refunded',
  'system.announcement': 'System Announcement',
  'marketing.campaign': 'Marketing Campaign',
  'export.completed': 'Data Export Completed',
  'export.failed': 'Data Export Failed',
};

export const NOTIFICATION_EVENT_OPTIONS: ReadonlyArray<{ value: NotificationEventKey; label: string }> =
  Object.entries(NOTIFICATION_EVENT_LABELS).map(([value, label]) => ({
    value: value as NotificationEventKey,
    label,
  }));

export interface NotificationEventFlowRecipient {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatar?: string | null;
}

export interface NotificationEventFlowTemplateSummary {
  id: string;
  name: string;
  subject: string;
  type: string;
  description?: string | null;
}

export interface NotificationEventFlow {
  id: string;
  eventKey: NotificationEventKey;
  displayName: string;
  description?: string | null;
  channelPreferences: NotificationChannel[];
  includeActor: boolean;
  isActive: boolean;
  mailTemplates: NotificationEventFlowTemplateSummary[];
  recipientUserIds: string[];
  ccUserIds: string[];
  bccUserIds: string[];
  ccEmails: string[];
  bccEmails: string[];
  recipients: NotificationEventFlowRecipient[];
  ccRecipients: NotificationEventFlowRecipient[];
  bccRecipients: NotificationEventFlowRecipient[];
  channelMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
