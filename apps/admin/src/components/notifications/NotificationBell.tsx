import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  Divider,
  Avatar,
  ListItemText,
  ListItemAvatar,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNotifications, NotificationData } from '@admin/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import NotificationSettings from '@admin/components/notifications/NotificationSettings';
import { useNavigate } from 'react-router-dom';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 380, // Slightly narrower
    maxHeight: 550,
    borderRadius: 16,
    marginTop: theme.spacing(1),
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiList-root': {
    padding: 0,
  }
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const NotificationScrollArea = styled(Box)(({ theme }) => ({
  maxHeight: 380,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3,
  },
}));

const NotificationItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5), // Tighter padding
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  whiteSpace: 'normal',
  alignItems: 'flex-start',
  transition: 'background-color 0.2s',
  gap: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .notification-actions': {
      opacity: 1,
    }
  },
  '&.unread': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04), // subtler unread background
  },
}));

const NotificationActions = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.background.default, 0.8),
}));

interface NotificationBellProps {
  maxNotifications?: number;
  currentUserId?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ maxNotifications = 20, currentUserId }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasPermission,
    isSupported,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    setupMessageListener,
  } = useNotifications();

  useEffect(() => {
    const unsubscribe = setupMessageListener();
    return unsubscribe || undefined;
  }, [setupMessageListener]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!open) refreshNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
    handleClose();
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'product': return '📦';
      case 'order': return '🛒';
      case 'user': return '👤';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'product': return 'primary';
      case 'order': return 'secondary';
      case 'user': return 'info';
      default: return 'default';
    }
  };

  const displayNotifications = notifications.slice(0, maxNotifications);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="large"
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <NotificationHeader>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={refreshNotifications}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {currentUserId && (
              <Tooltip title="Settings">
                <IconButton size="small" onClick={() => { handleClose(); navigate('/notifications/preferences'); }}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </NotificationHeader>

        {isSupported && !hasPermission && (
          <Box p={2}>
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" onClick={requestPermission}>
                  Enable
                </Button>
              }
            >
              Enable notifications to stay updated
            </Alert>
          </Box>
        )}

        {error && (
          <Box p={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <NotificationScrollArea>
          {isLoading && notifications.length === 0 ? (
            <Box p={4} display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          ) : displayNotifications.length > 0 ? (
            displayNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                className={!notification.read ? 'unread' : ''}
                onClick={() => handleNotificationClick(notification)}
                disableGutters
              >
                <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: '1.2rem',
                      bgcolor: alpha(theme.palette[getNotificationColor(notification.type) as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success']?.main || theme.palette.grey[500], 0.1),
                      color: theme.palette[getNotificationColor(notification.type) as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success']?.main || theme.palette.grey[700],
                      border: `1px solid ${alpha(theme.palette[getNotificationColor(notification.type) as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success']?.main || theme.palette.grey[500], 0.2)}`
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                    <Typography
                      variant="body2"
                      fontWeight={!notification.read ? 700 : 600}
                      color="text.primary"
                      sx={{ mr: 1, lineHeight: 1.3 }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.7rem' }}>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      lineHeight: 1.4,
                      fontSize: '0.8125rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {notification.body}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ minHeight: 24 }}>
                    {notification.actionUrl ? (
                      <Typography
                        variant="caption"
                        color="primary"
                        fontWeight={600}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                          display: 'flex', alignItems: 'center'
                        }}
                      >
                        View Details
                      </Typography>
                    ) : <span />}

                    <Stack
                      direction="row"
                      spacing={0.5}
                      className="notification-actions"
                      sx={{
                        opacity: 0.6,
                        transition: 'opacity 0.2s',
                        ml: 'auto'
                      }}
                    >
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            sx={{ padding: 0.5 }}
                          >
                            <MarkAsUnreadIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(e, notification.id)}
                          sx={{ padding: 0.5, '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              </NotificationItem>
            ))
          ) : (
            <Box p={4} textAlign="center">
              <NotificationsNoneIcon color="action" sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          )}
        </NotificationScrollArea>

        {displayNotifications.length > 0 && (
          <NotificationActions>
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => { handleClose(); navigate('/notifications'); }}
            >
              View All
            </Button>
          </NotificationActions>
        )}

      </StyledMenu>

      {/* Notification Settings Dialog */}
      {currentUserId && (
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogContent dividers>
            <NotificationSettings
              userId={currentUserId}
              onSave={() => refreshNotifications()}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default NotificationBell;
