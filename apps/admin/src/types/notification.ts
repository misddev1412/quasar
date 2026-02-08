export type NotificationCategory =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'product'
  | 'order'
  | 'user';

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  type: NotificationCategory;
  read: boolean;
  createdAt: string;
  user: {
    email?: string;
  };
};

export type AdminNotificationStats = {
  total?: number;
  unread?: number;
  sentToday?: number;
  failed?: number;
  totalTrend?: { value: number; isPositive: boolean; label: string };
  unreadTrend?: { value: number; isPositive: boolean; label: string };
  sentTodayTrend?: { value: number; isPositive: boolean; label: string };
  failedTrend?: { value: number; isPositive: boolean; label: string };
};

export type NotificationListResponse = {
  data?: {
    notifications?: AdminNotification[];
    items?: AdminNotification[];
    total?: number;
  };
};

export type NotificationStatsResponse = {
  data?: AdminNotificationStats;
};
