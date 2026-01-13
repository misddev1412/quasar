'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Button,
  Badge,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../types/trpc';

// Import icons directly instead of from Header to avoid circular dependency
const Icons = {
  Bell: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  // Use the notifications hook with recent notifications enabled
  const {
    recentNotifications: notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    enableRecent: true,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <Icons.Bell className="text-green-500" />;
      case NotificationType.WARNING:
        return <Icons.Bell className="text-yellow-500" />;
      case NotificationType.ERROR:
        return <Icons.Bell className="text-red-500" />;
      case NotificationType.INFO:
      default:
        return <Icons.Bell className="text-blue-500" />;
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('notifications.time.justNow');
    if (diffInMinutes < 60) return t('notifications.time.minutesAgo', { count: diffInMinutes });
    if (diffInMinutes < 1440) return t('notifications.time.hoursAgo', { count: Math.floor(diffInMinutes / 60) });
    return t('notifications.time.daysAgo', { count: Math.floor(diffInMinutes / 1440) });
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const viewAllNotifications = () => {
    router.push('/notifications');
  };

  if (!isAuthenticated) {
    return (
      <Button
        isIconOnly
        variant="light"
        aria-label={t('layout.header.actions.notifications')}
        className={`hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 ${className}`}
        onPress={() => router.push('/login')}
      >
        <Icons.Bell />
      </Button>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="light"
          aria-label={t('layout.header.actions.notifications')}
          className={`hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 ${className}`}
        >
          <div className="relative">
            <Icons.Bell />
            {unreadCount > 0 && (
              <Badge
                color="danger"
                size="sm"
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Notifications"
        className="max-w-sm w-80 max-h-96 overflow-hidden"
        variant="flat"
      >
        <DropdownSection showDivider>
          <DropdownItem
            key="header"
            className="h-12 py-2"
            isReadOnly
            textValue="Notifications header"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">
                {t('notifications.title')}
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs text-danger">
                    ({unreadCount} {t('notifications.unread')})
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  className="text-xs"
                  onPress={() => markAllAsRead()}
                >
                  {t('notifications.markAllAsRead')}
                </Button>
              )}
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <DropdownItem key="loading" isReadOnly>
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            </DropdownItem>
          ) : notifications.length === 0 ? (
            <DropdownItem key="empty" isReadOnly>
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {t('notifications.noNotifications')}
              </div>
            </DropdownItem>
          ) : (
            <>
              {notifications.map((notification) => (
                <DropdownItem
                  key={notification.id}
                  className={`py-3 min-h-[auto] ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  textValue={notification.title}
                  onPress={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      {notification.actionUrl && (
                        <Button
                          size="sm"
                          variant="light"
                          className="mt-2 text-xs"
                          onPress={() => router.push(notification.actionUrl!)}
                        >
                          {t('notifications.viewDetails')}
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownItem>
              ))}
            </>
          )}
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
            key="view-all"
            className="py-2 text-center"
            textValue="View all notifications"
            onPress={viewAllNotifications}
          >
            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              {t('notifications.viewAll')}
            </span>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationDropdown;
