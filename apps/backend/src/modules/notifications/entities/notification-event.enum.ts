export enum NotificationEvent {
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  ORDER_CREATED = 'order.created',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_REFUNDED = 'order.refunded',
  SYSTEM_ANNOUNCEMENT = 'system.announcement',
  MARKETING_CAMPAIGN = 'marketing.campaign',
  CUSTOM = 'custom.manual',
}

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  [NotificationEvent.USER_REGISTERED]: 'User Registered',
  [NotificationEvent.USER_VERIFIED]: 'User Verified',
  [NotificationEvent.ORDER_CREATED]: 'Order Created',
  [NotificationEvent.ORDER_CONFIRMED]: 'Order Confirmed',
  [NotificationEvent.ORDER_SHIPPED]: 'Order Shipped',
  [NotificationEvent.ORDER_DELIVERED]: 'Order Delivered',
  [NotificationEvent.ORDER_CANCELLED]: 'Order Cancelled',
  [NotificationEvent.ORDER_REFUNDED]: 'Order Refunded',
  [NotificationEvent.SYSTEM_ANNOUNCEMENT]: 'System Announcement',
  [NotificationEvent.MARKETING_CAMPAIGN]: 'Marketing Campaign',
  [NotificationEvent.CUSTOM]: 'Manual / Custom',
};
