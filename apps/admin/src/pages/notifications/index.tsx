import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  FiSend,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiBell,
  FiBellOff,
  FiRadio,
  FiUsers,
  FiUser,
  FiHome,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';


const NotificationsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    type: 'single',
    title: '',
    body: '',
    notificationType: 'info',
    actionUrl: '',
    userIds: '',
    topic: '',
  });

  // Query notifications from tRPC API
  const { data: notificationsData, isLoading, error, refetch } = trpc.adminNotification.getNotifications.useQuery({
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Query notification statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminNotification.getNotificationStats.useQuery({}, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutations for notifications
  const sendNotificationMutation = trpc.adminNotification.sendNotificationToUser.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Notification sent successfully',
        type: 'success'
      });
      refetch();
      handleSendDialogClose();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: `Failed to send notification: ${error.message}`,
        type: 'error'
      });
    },
  });

  const sendBulkNotificationMutation = trpc.adminNotification.sendBulkNotifications.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Bulk notifications sent successfully',
        type: 'success'
      });
      refetch();
      handleSendDialogClose();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: `Failed to send bulk notifications: ${error.message}`,
        type: 'error'
      });
    },
  });

  const sendTopicNotificationMutation = trpc.adminNotification.sendTopicNotification.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Topic notification sent successfully',
        type: 'success'
      });
      refetch();
      handleSendDialogClose();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: `Failed to send topic notification: ${error.message}`,
        type: 'error'
      });
    },
  });

  const markAsReadMutation = trpc.adminNotification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: `Failed to mark as read: ${error.message}`,
        type: 'error'
      });
    },
  });

  const deleteNotificationMutation = trpc.adminNotification.deleteNotification.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Notification deleted successfully',
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: `Failed to delete notification: ${error.message}`,
        type: 'error'
      });
    },
  });

  const notifications = (notificationsData as any)?.data?.notifications || (notificationsData as any)?.data?.items || [];
  const totalNotifications = (notificationsData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalNotifications / limit);

  const stats = (statsData as any)?.data || {};


  const handleSendNotification = () => {
    setSendDialogOpen(true);
  };

  const handleSendDialogClose = () => {
    setSendDialogOpen(false);
    setSendForm({
      type: 'single',
      title: '',
      body: '',
      notificationType: 'info',
      actionUrl: '',
      userIds: '',
      topic: '',
    });
  };

  const handleSendFormSubmit = async () => {
    try {
      if (sendForm.type === 'single') {
        await sendNotificationMutation.mutateAsync({
          userId: sendForm.userIds.trim(),
          title: sendForm.title,
          body: sendForm.body,
          type: sendForm.notificationType as any,
          actionUrl: sendForm.actionUrl || undefined,
        });
      } else if (sendForm.type === 'bulk') {
        const userIds = sendForm.userIds.split(',').map(id => id.trim()).filter(id => id);
        await sendBulkNotificationMutation.mutateAsync({
          userIds,
          title: sendForm.title,
          body: sendForm.body,
          type: sendForm.notificationType as any,
          actionUrl: sendForm.actionUrl || undefined,
        });
      } else if (sendForm.type === 'topic') {
        await sendTopicNotificationMutation.mutateAsync({
          topic: sendForm.topic,
          title: sendForm.title,
          body: sendForm.body,
          actionUrl: sendForm.actionUrl || undefined,
        });
      }
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const getNotificationColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'product':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'order':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'user':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const statistics: StatisticData[] = [
    {
      id: 'total',
      title: 'Total Notifications',
      value: stats.total || 0,
      icon: <FiBell className="w-6 h-6" />,
      trend: stats.totalTrend ? { value: stats.totalTrend.value, isPositive: stats.totalTrend.isPositive, label: stats.totalTrend.label } : undefined,
    },
    {
      id: 'unread',
      title: 'Unread',
      value: stats.unread || 0,
      icon: <FiBellOff className="w-6 h-6" />,
      trend: stats.unreadTrend ? { value: stats.unreadTrend.value, isPositive: stats.unreadTrend.isPositive, label: stats.unreadTrend.label } : undefined,
    },
    {
      id: 'sent',
      title: 'Sent Today',
      value: stats.sentToday || 0,
      icon: <FiSend className="w-6 h-6" />,
      trend: stats.sentTodayTrend ? { value: stats.sentTodayTrend.value, isPositive: stats.sentTodayTrend.isPositive, label: stats.sentTodayTrend.label } : undefined,
    },
    {
      id: 'failed',
      title: 'Failed',
      value: stats.failed || 0,
      icon: <FiBellOff className="w-6 h-6" />,
      trend: stats.failedTrend ? { value: stats.failedTrend.value, isPositive: stats.failedTrend.isPositive, label: stats.failedTrend.label } : undefined,
    },
  ];

  const columns: Column<any>[] = [
    {
      header: 'Title',
      accessor: (notification: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {notification.title}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {notification.body}
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      header: 'Type',
      accessor: (notification: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getNotificationColorClass(notification.type)}`}>
          {notification.type}
        </span>
      ),
      isSortable: true,
    },
    {
      header: 'User',
      accessor: (notification: any) => notification.user.email,
    },
    {
      header: 'Status',
      accessor: (notification: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          notification.read
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
        }`}>
          {notification.read ? 'Read' : 'Unread'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: (notification: any) => formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
      isSortable: true,
    },
    {
      header: 'Actions',
      accessor: (notification: any) => (
        <div className="flex space-x-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsReadMutation.mutate({ id: notification.id })}
              title="Mark as Read"
            >
              <FiEye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteNotificationMutation.mutate({ id: notification.id })}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <BaseLayout
      title="Notifications"
      breadcrumbs={[
        {
          label: 'Home',
          href: '/',
          icon: <FiHome className="h-4 w-4" />,
        },
        {
          label: 'Notifications',
          icon: <FiBell className="h-4 w-4" />,
        },
      ]}
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and send notifications to users
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={handleSendNotification}
              className="flex items-center space-x-2"
            >
              <FiSend className="w-4 h-4" />
              <span>Send Notification</span>
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <StatisticsGrid statistics={statistics} isLoading={statsLoading} />

        {/* Notifications Table */}
        <Table
          data={notifications}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            currentPage: page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      </div>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onClose={handleSendDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <FormControl fullWidth>
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={sendForm.type}
                label="Notification Type"
                onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
              >
                <MenuItem value="single">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>Single User</span>
                  </div>
                </MenuItem>
                <MenuItem value="bulk">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4" />
                    <span>Multiple Users</span>
                  </div>
                </MenuItem>
                <MenuItem value="topic">
                  <div className="flex items-center space-x-2">
                    <FiRadio className="w-4 h-4" />
                    <span>Topic Broadcast</span>
                  </div>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title"
              fullWidth
              value={sendForm.title}
              onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              required
            />

            <TextField
              label="Message Body"
              fullWidth
              multiline
              rows={3}
              value={sendForm.body}
              onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={sendForm.notificationType}
                label="Category"
                onChange={(e) => setSendForm({ ...sendForm, notificationType: e.target.value })}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="order">Order</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Action URL (Optional)"
              fullWidth
              value={sendForm.actionUrl}
              onChange={(e) => setSendForm({ ...sendForm, actionUrl: e.target.value })}
              placeholder="https://example.com/action"
            />

            {sendForm.type === 'single' || sendForm.type === 'bulk' ? (
              <TextField
                label="User IDs or Emails"
                fullWidth
                multiline
                rows={2}
                value={sendForm.userIds}
                onChange={(e) => setSendForm({ ...sendForm, userIds: e.target.value })}
                placeholder="user1@example.com, user2@example.com"
                helperText="Separate multiple users with commas"
              />
            ) : (
              <TextField
                label="Topic Name"
                fullWidth
                value={sendForm.topic}
                onChange={(e) => setSendForm({ ...sendForm, topic: e.target.value })}
                placeholder="all-users"
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={handleSendDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendFormSubmit}
            disabled={!sendForm.title || !sendForm.body || sendNotificationMutation.isPending || sendBulkNotificationMutation.isPending || sendTopicNotificationMutation.isPending}
          >
            {sendNotificationMutation.isPending || sendBulkNotificationMutation.isPending || sendTopicNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>
    </BaseLayout>
  );
};

export default NotificationsPage;
