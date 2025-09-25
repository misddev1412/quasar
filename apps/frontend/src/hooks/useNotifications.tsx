'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Notification, NotificationType, NotificationWithPagination } from '../types/trpc';

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (notificationIds?: string[]) => Promise<void>;
  createNotification: (data: {
    title: string;
    body: string;
    type?: NotificationType;
    actionUrl?: string;
    icon?: string;
    image?: string;
    data?: Record<string, unknown>;
  }) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetch: () => void;
}

export const useNotifications = (
  options: UseNotificationsOptions = {}
): UseNotificationsReturn => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { trpcClient } = await import('../utils/trpc');

      const response = await (trpcClient as any).clientNotification.getUserNotifications.query({
        userId: user.id,
        page,
        limit,
      });

      if (response?.data?.data) {
        const data = response.data.data as NotificationWithPagination;
        setNotifications(data.notifications);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { trpcClient } = await import('../utils/trpc');

      const response = await (trpcClient as any).clientNotification.getUnreadCount.query({
        userId: user.id,
      });

      if (response?.data?.data) {
        setUnreadCount(response.data.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [isAuthenticated, user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const { trpcClient } = await import('../utils/trpc');

      await (trpcClient as any).clientNotification.markAllAsRead.mutate({
        userId: user.id,
        notificationIds: [notificationId],
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
      console.error('Failed to mark notification as read:', err);
    }
  }, [isAuthenticated, user]);

  const markAllAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!isAuthenticated || !user) return;

    try {
      const { trpcClient } = await import('../utils/trpc');

      await (trpcClient as any).clientNotification.markAllAsRead.mutate({
        userId: user.id,
        notificationIds,
      });

      // Update local state
      if (notificationIds) {
        setNotifications(prev =>
          prev.map(n => notificationIds.includes(n.id) ? { ...n, read: true } : n)
        );
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notifications as read'));
      console.error('Failed to mark notifications as read:', err);
    }
  }, [isAuthenticated, user]);

  const createNotification = useCallback(async (data: {
    title: string;
    body: string;
    type?: NotificationType;
    actionUrl?: string;
    icon?: string;
    image?: string;
    data?: Record<string, unknown>;
  }) => {
    if (!isAuthenticated || !user) return;

    try {
      const { trpcClient } = await import('../utils/trpc');

      await (trpcClient as any).clientNotification.createNotification.mutate({
        userId: user.id,
        ...data,
      });

      // Refresh notifications
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create notification'));
      console.error('Failed to create notification:', err);
    }
  }, [isAuthenticated, user, fetchNotifications, fetchUnreadCount]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const { trpcClient } = await import('../utils/trpc');

      // Note: This would need to be implemented in the backend
      // For now, we'll just remove it from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // If the notification was unread, update the count
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notification'));
      console.error('Failed to delete notification:', err);
    }
  }, [isAuthenticated, user, notifications]);

  const refetch = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchUnreadCount();

      if (autoRefresh) {
        const interval = setInterval(() => {
          fetchUnreadCount();
        }, refreshInterval);

        return () => clearInterval(interval);
      }
    } else {
      // Reset state when not authenticated
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }
  }, [isAuthenticated, user, autoRefresh, refreshInterval, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    refetch,
  };
};

export default useNotifications;