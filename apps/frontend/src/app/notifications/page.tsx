'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Badge,
  Divider,
  Chip,
  Spinner,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Notification, NotificationType, NotificationWithPagination } from '../../types/trpc';
// Import icons directly instead of from Header to avoid circular dependency
const Icons = {
  Bell: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Cart: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  User: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<{
    type?: NotificationType;
    read?: boolean;
  }>({});

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <Icons.Bell className="text-green-500" />;
      case NotificationType.WARNING:
        return <Icons.Bell className="text-yellow-500" />;
      case NotificationType.ERROR:
        return <Icons.Bell className="text-red-500" />;
      case NotificationType.SYSTEM:
        return <Icons.Settings className="text-purple-500" />;
      case NotificationType.PRODUCT:
        return <Icons.Cart className="text-blue-500" />;
      case NotificationType.ORDER:
        return <Icons.Cart className="text-orange-500" />;
      case NotificationType.USER:
        return <Icons.User className="text-indigo-500" />;
      case NotificationType.INFO:
      default:
        return <Icons.Bell className="text-blue-500" />;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.ERROR:
        return 'danger';
      case NotificationType.SYSTEM:
        return 'secondary';
      case NotificationType.PRODUCT:
        return 'primary';
      case NotificationType.ORDER:
        return 'warning';
      case NotificationType.USER:
        return 'default';
      case NotificationType.INFO:
      default:
        return 'default';
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

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    try {
      const { trpcClient } = await import('../../utils/trpc');

      const response = await (trpcClient as any).clientNotification.getUserNotifications.query({
        userId: user.id,
        page,
        limit: pagination.limit,
        ...filters,
      });

      if (response?.data?.data) {
        const data = response.data.data as NotificationWithPagination;
        setNotifications(data.notifications);
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev,
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, pagination.limit, filters]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { trpcClient } = await import('../../utils/trpc');

      await (trpcClient as any).clientNotification.markAllAsRead.mutate({
        userId: user!.id,
        notificationIds: [notificationId],
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { trpcClient } = await import('../../utils/trpc');

      await (trpcClient as any).clientNotification.markAllAsRead.mutate({
        userId: user!.id,
      });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications(pagination.page);
    }
  }, [isAuthenticated, user, pagination.page, filters, fetchNotifications]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-8">
            <Icons.Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">{t('notifications.loginRequired')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('notifications.pleaseLogin')}
            </p>
            <Button
              color="primary"
              onPress={() => window.location.href = '/login'}
            >
              {t('notifications.signIn')}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('notifications.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('notifications.description')}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={!filters.type ? 'solid' : 'flat'}
                color="primary"
                onPress={() => handleFilterChange({ ...filters, type: undefined })}
              >
                {t('notifications.allTypes')}
              </Button>
              <Button
                size="sm"
                variant={filters.type === NotificationType.INFO ? 'solid' : 'flat'}
                color="default"
                onPress={() => handleFilterChange({ ...filters, type: NotificationType.INFO })}
              >
                {t('notifications.types.info')}
              </Button>
              <Button
                size="sm"
                variant={filters.type === NotificationType.SUCCESS ? 'solid' : 'flat'}
                color="success"
                onPress={() => handleFilterChange({ ...filters, type: NotificationType.SUCCESS })}
              >
                {t('notifications.types.success')}
              </Button>
              <Button
                size="sm"
                variant={filters.type === NotificationType.WARNING ? 'solid' : 'flat'}
                color="warning"
                onPress={() => handleFilterChange({ ...filters, type: NotificationType.WARNING })}
              >
                {t('notifications.types.warning')}
              </Button>
              <Button
                size="sm"
                variant={filters.type === NotificationType.ERROR ? 'solid' : 'flat'}
                color="danger"
                onPress={() => handleFilterChange({ ...filters, type: NotificationType.ERROR })}
              >
                {t('notifications.types.error')}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={!filters.read ? 'solid' : 'flat'}
                color="primary"
                onPress={() => handleFilterChange({ ...filters, read: undefined })}
              >
                {t('notifications.allStatus')}
              </Button>
              <Button
                size="sm"
                variant={filters.read === false ? 'solid' : 'flat'}
                color="warning"
                onPress={() => handleFilterChange({ ...filters, read: false })}
              >
                {t('notifications.unread')}
              </Button>
              <Button
                size="sm"
                variant={filters.read === true ? 'solid' : 'flat'}
                color="default"
                onPress={() => handleFilterChange({ ...filters, read: true })}
              >
                {t('notifications.read')}
              </Button>
            </div>
            <div className="ml-auto">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={markAllAsRead}
              >
                {t('notifications.markAllAsRead')}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardBody className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </CardBody>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Icons.Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">{t('notifications.noNotifications')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('notifications.noNotificationsDesc')}
              </p>
            </CardBody>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <CardBody>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Avatar
                      size="md"
                      className="bg-gray-100 dark:bg-gray-800"
                      fallback={getNotificationIcon(notification.type)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={getTypeColor(notification.type)}
                          >
                            {t(`notifications.types.${notification.type.toLowerCase()}`)}
                          </Chip>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => markAsRead(notification.id)}
                        >
                          {t('notifications.markAsRead')}
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notification.body}
                    </p>
                    {notification.actionUrl && (
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => window.location.href = notification.actionUrl!}
                      >
                        {t('notifications.viewDetails')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.showing', {
                  from: (pagination.page - 1) * pagination.limit + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={!pagination.hasPrev}
                  onPress={() => handlePageChange(pagination.page - 1)}
                >
                  {t('notifications.previous')}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={!pagination.hasNext}
                  onPress={() => handlePageChange(pagination.page + 1)}
                >
                  {t('notifications.next')}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}