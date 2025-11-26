export enum NotificationEvent {
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  ORDER_CREATED = 'order.created',
  ORDER_SHIPPED = 'order.shipped',
  SYSTEM_ANNOUNCEMENT = 'system.announcement',
  MARKETING_CAMPAIGN = 'marketing.campaign',
  CUSTOM = 'custom.manual',
}

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  [NotificationEvent.USER_REGISTERED]: 'User Registered',
  [NotificationEvent.USER_VERIFIED]: 'User Verified',
  [NotificationEvent.ORDER_CREATED]: 'Order Created',
  [NotificationEvent.ORDER_SHIPPED]: 'Order Shipped',
  [NotificationEvent.SYSTEM_ANNOUNCEMENT]: 'System Announcement',
  [NotificationEvent.MARKETING_CAMPAIGN]: 'Marketing Campaign',
  [NotificationEvent.CUSTOM]: 'Manual / Custom',
};
