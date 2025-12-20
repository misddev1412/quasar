import { useState, useEffect, useCallback } from 'react';
import { MessagePayload } from 'firebase/messaging';
import { firebaseService } from '../services/firebase.service';
import { trpcClient } from '../utils/trpc';
import { TrpcApiResponse } from '@shared/types/api-response.types';
import { useFirebaseAuth } from './useFirebaseAuth';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  actionUrl?: string;
  icon?: string;
  image?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationApiEntity {
  id: string;
  title: string;
  body: string;
  type: string;
  actionUrl?: string | null;
  icon?: string | null;
  image?: string | null;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
}

interface NotificationsApiPayload {
  items: NotificationApiEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const mapNotificationFromApi = (notification: NotificationApiEntity): NotificationData => ({
  id: notification.id,
  title: notification.title,
  body: notification.body,
  type: notification.type || 'info',
  actionUrl: notification.actionUrl ?? undefined,
  icon: notification.icon ?? undefined,
  image: notification.image ?? undefined,
  data: notification.data ?? undefined,
  read: Boolean(notification.read),
  createdAt: notification.createdAt,
  readAt: notification.readAt ?? undefined,
});

const extractData = <T,>(response: unknown): T | null => {
  const trpcResponse = response as TrpcApiResponse<T> | undefined;
  return trpcResponse?.data ?? null;
};

export interface NotificationState {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface UseNotificationsReturn {
  // State
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Permissions and setup
  hasPermission: boolean;
  isSupported: boolean;
  fcmToken: string | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  getFCMToken: () => Promise<string | null>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // Real-time messaging
  setupMessageListener: () => () => void | null;
}

export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  });

  const [hasPermission, setHasPermission] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { initialized: firebaseInitialized } = useFirebaseAuth();

  const refreshNotifications = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [notificationsResponse, unreadResponse] = await Promise.all([
        (trpcClient as any).userNotification.getMyNotifications.query({
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }),
        (trpcClient as any).userNotification.getMyUnreadCount.query(),
      ]);

      const notificationsData = extractData<NotificationsApiPayload>(notificationsResponse);
      const unreadData = extractData<{ count: number }>(unreadResponse);

      setState(prev => ({
        ...prev,
        notifications: notificationsData?.items?.map(mapNotificationFromApi) ?? [],
        unreadCount: unreadData?.count ?? 0,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load notifications',
        isLoading: false
      }));
    }
  }, []);

  const getFCMToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseInitialized || !firebaseService.isInitialized()) {
      setState(prev => ({
        ...prev,
        error: 'Firebase is not initialized yet'
      }));
      return null;
    }

    try {
      const token = await firebaseService.getFCMToken();
      setFcmToken(token);

      if (token) {
        try {
          await (trpcClient as any).userNotification.registerFCMToken.mutate({
            token,
            deviceInfo: {
              platform: 'web' as const,
              browser: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
              version: typeof navigator !== 'undefined' ? navigator.appVersion : undefined,
            },
          });
        } catch (registerError) {
          console.error('Error registering FCM token:', registerError);
        }
      }

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get FCM token'
      }));
      return null;
    }
  }, [firebaseInitialized]);

  // Initialize notification system
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (firebaseInitialized && firebaseService.isInitialized()) {
          setIsSupported(firebaseService.isMessagingSupported());
          setHasPermission(firebaseService.getNotificationPermission() === 'granted');
        } else {
          setIsSupported(false);
        }

        await refreshNotifications();
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize notifications'
        }));
      }
    };

    initializeNotifications();
  }, [firebaseInitialized, refreshNotifications]);

  useEffect(() => {
    if (
      firebaseInitialized &&
      firebaseService.isInitialized() &&
      isSupported &&
      hasPermission &&
      !fcmToken
    ) {
      getFCMToken().catch(error => {
        console.error('Error getting FCM token after permission granted:', error);
      });
    }
  }, [firebaseInitialized, isSupported, hasPermission, fcmToken, getFCMToken]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!firebaseInitialized || !firebaseService.isInitialized() || !isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications are not available in this environment'
      }));
      return false;
    }

    try {
      const permission = await firebaseService.requestNotificationPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);

      if (granted && !fcmToken) {
        await getFCMToken();
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to request notification permission'
      }));
      return false;
    }
  }, [firebaseInitialized, isSupported, fcmToken, getFCMToken]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await (trpcClient as any).userNotification.markMyNotificationAsRead.mutate({ id });
      const updatedNotification = extractData<NotificationApiEntity>(response);

      setState(prev => {
        const wasUnread = prev.notifications.some(notif => notif.id === id && !notif.read);
        return {
          ...prev,
          notifications: prev.notifications.map(notif =>
            notif.id === id
              ? updatedNotification
                ? mapNotificationFromApi(updatedNotification)
                : { ...notif, read: true, readAt: notif.readAt || new Date().toISOString() }
              : notif
          ),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to mark notification as read'
      }));
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await (trpcClient as any).userNotification.markAllMyNotificationsAsRead.mutate();

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => ({
          ...notif,
          read: true,
          readAt: notif.readAt || new Date().toISOString()
        })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to mark all notifications as read'
      }));
    }
  }, []);

  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
      await (trpcClient as any).userNotification.deleteMyNotification.mutate({ id });

      setState(prev => {
        const notification = prev.notifications.find(n => n.id === id);
        const wasUnread = notification && !notification.read;

        return {
          ...prev,
          notifications: prev.notifications.filter(notif => notif.id !== id),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete notification'
      }));
    }
  }, []);

  const setupMessageListener = useCallback((): (() => void) | null => {
    if (!isSupported || !firebaseInitialized || !firebaseService.isInitialized()) {
      return null;
    }

    const unsubscribe = firebaseService.onMessage((payload: MessagePayload) => {
      console.log('Message received in foreground:', payload);

      if (hasPermission && payload.notification) {
        firebaseService.showNotification(
          payload.notification.title || 'New notification',
          {
            body: payload.notification.body,
            icon: payload.notification.icon,
            data: payload.data,
            tag: payload.data?.tag || 'default'
          }
        );
      }

      refreshNotifications();
    });

    return unsubscribe;
  }, [isSupported, firebaseInitialized, hasPermission, refreshNotifications]);

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,

    // Permissions and setup
    hasPermission,
    isSupported,
    fcmToken,

    // Actions
    requestPermission,
    getFCMToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,

    // Real-time messaging
    setupMessageListener,
  };
}
