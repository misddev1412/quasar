import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../services/firebase.service';
import { MessagePayload } from 'firebase/messaging';

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

  // Initialize notification system
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (!firebaseService.isInitialized()) {
          return;
        }

        setIsSupported(firebaseService.isMessagingSupported());
        setHasPermission(firebaseService.getNotificationPermission() === 'granted');

        // Get initial notifications
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
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
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
  }, [fcmToken]);

  const getFCMToken = useCallback(async (): Promise<string | null> => {
    try {
      // You should get the VAPID key from your Firebase console
      const token = await firebaseService.getFCMToken();
      setFcmToken(token);

      // Register token with your backend
      if (token) {
        // TODO: Call your API to register the FCM token
        // await api.registerFCMToken({ token });
        console.log('FCM Token:', token);
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
  }, []);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Replace with actual API calls to your backend
      // const response = await api.getMyNotifications();
      // const unreadResponse = await api.getMyUnreadCount();

      // Mock data for now
      const mockNotifications: NotificationData[] = [];
      const mockUnreadCount = 0;

      setState(prev => ({
        ...prev,
        notifications: mockNotifications,
        unreadCount: mockUnreadCount,
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

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      // TODO: Call your API to mark notification as read
      // await api.markNotificationAsRead({ id });

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === id
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
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
      // TODO: Call your API to mark all notifications as read
      // await api.markAllNotificationsAsRead();

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
      // TODO: Call your API to delete notification
      // await api.deleteNotification({ id });

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
    if (!isSupported) {
      return null;
    }

    const unsubscribe = firebaseService.onMessage((payload: MessagePayload) => {
      console.log('Message received in foreground:', payload);

      // Show browser notification
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

      // Add to local state
      if (payload.notification) {
        const newNotification: NotificationData = {
          id: Date.now().toString(), // Temporary ID
          title: payload.notification.title || 'Notification',
          body: payload.notification.body || '',
          type: payload.data?.type || 'info',
          actionUrl: payload.data?.actionUrl,
          icon: payload.notification.icon,
          image: payload.notification.image,
          data: payload.data,
          read: false,
          createdAt: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          notifications: [newNotification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1
        }));
      }
    });

    return unsubscribe;
  }, [isSupported, hasPermission]);

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