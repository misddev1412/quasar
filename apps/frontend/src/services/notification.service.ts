import { trpcClient } from '../utils/trpc';
import type {
  Notification,
  NotificationType,
  NotificationWithPagination
} from '../types/trpc';

export interface NotificationService {
  getRecentNotifications: (userId: string, limit?: number) => Promise<Notification[]>;
  getUnreadCount: (userId: string) => Promise<number>;
  getUserNotifications: (
    userId: string,
    page?: number,
    limit?: number,
    filters?: {
      type?: NotificationType;
      read?: boolean;
    }
  ) => Promise<NotificationWithPagination>;
  markAsRead: (userId: string, notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string, notificationIds?: string[]) => Promise<void>;
  createNotification: (data: {
    userId: string;
    title: string;
    body: string;
    type?: NotificationType;
    actionUrl?: string;
    icon?: string;
    image?: string;
    data?: Record<string, unknown>;
  }) => Promise<Notification>;
  getNotificationTypes: () => Promise<Array<{ value: NotificationType; label: string }>>;
}

class NotificationServiceImpl implements NotificationService {
  async getRecentNotifications(userId: string, limit = 5): Promise<Notification[]> {
    try {
      const response = await (trpcClient as any).clientNotification.getRecentNotifications.query({
        userId,
        limit,
      });

      return response?.data || [];
    } catch (error) {
      console.error('Failed to get recent notifications:', error);
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await (trpcClient as any).clientNotification.getUnreadCount.query({
        userId,
      });

      return response?.data?.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    filters?: {
      type?: NotificationType;
      read?: boolean;
    }
  ): Promise<NotificationWithPagination> {
    try {
      const response = await (trpcClient as any).clientNotification.getUserNotifications.query({
        userId,
        page,
        limit,
        ...filters,
      });

      return response?.data || {
        notifications: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return {
        notifications: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await (trpcClient as any).clientNotification.markAllAsRead.mutate({
        userId,
        notificationIds: [notificationId],
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string, notificationIds?: string[]): Promise<void> {
    try {
      await (trpcClient as any).clientNotification.markAllAsRead.mutate({
        userId,
        notificationIds,
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async createNotification(data: {
    userId: string;
    title: string;
    body: string;
    type?: NotificationType;
    actionUrl?: string;
    icon?: string;
    image?: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    try {
      const response = await (trpcClient as any).clientNotification.createNotification.mutate(data);
      return response?.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getNotificationTypes(): Promise<Array<{ value: NotificationType; label: string }>> {
    try {
      const response = await (trpcClient as any).clientNotification.getNotificationTypes.query();
      return response?.data || [];
    } catch (error) {
      console.error('Failed to get notification types:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationServiceImpl();

// Export for easy mocking in tests
export { NotificationServiceImpl };