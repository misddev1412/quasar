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
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNotifications, NotificationData } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import NotificationSettings from './NotificationSettings';
import { useNavigate } from 'react-router-dom';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    minWidth: 380,
    maxWidth: 420,
    marginTop: theme.spacing(1.5),
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
    backdropFilter: 'blur(8px)',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(30, 30, 30, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
  },
  '& .MuiList-root': {
    padding: 0,
    borderRadius: 12,
    backgroundColor: 'transparent',
    maxHeight: 480,
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      borderRadius: 3,
    },
  },
  '& .MuiMenu-list': {
    padding: 0,
  },
}));

const NotificationItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(3, 3.5),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  minHeight: 'auto',
  alignItems: 'flex-start',
  position: 'relative',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
  },
  '&.unread': {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: theme.spacing(3.5),
      right: theme.spacing(3),
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(3)} !important`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(25, 25, 25, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
  backdropFilter: 'blur(12px)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  borderRadius: '16px 16px 0 0',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 20px rgba(0, 0, 0, 0.4)'
    : '0 2px 20px rgba(0, 0, 0, 0.06)',
}));

const NotificationActions = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: alpha(theme.palette.background.default, 0.4),
  backdropFilter: 'blur(8px)',
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
}));

const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

interface NotificationBellProps {
  maxNotifications?: number;
  currentUserId?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ maxNotifications = 5, currentUserId }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

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

  // Setup real-time message listener
  useEffect(() => {
    const unsubscribe = setupMessageListener();
    return unsubscribe || undefined;
  }, [setupMessageListener]);

  // Auto-refresh notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      refreshNotifications();
    }
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

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleViewAllNotifications = () => {
    handleClose();
    navigate('/notifications');
  };

  const handleNotificationSettings = () => {
    handleClose();
    navigate('/notifications/preferences');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'product':
        return '📦';
      case 'order':
        return '🛒';
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'product':
        return 'primary';
      case 'order':
        return 'secondary';
      case 'user':
        return 'info';
      case 'system':
        return 'default';
      default:
        return 'default';
    }
  };

  const displayNotifications = notifications.slice(0, maxNotifications);

  const notificationList = displayNotifications.map((notification) => (
    <NotificationItem
      key={notification.id}
      className={!notification.read ? 'unread' : ''}
      onClick={() => handleNotificationClick(notification)}
    >
      <ListItemAvatar sx={{ mt: 1 }}>
        <Avatar sx={(theme) => ({
          bgcolor: alpha(
            getNotificationColor(notification.type) === 'error'
              ? theme.palette.error.main
              : getNotificationColor(notification.type) === 'warning'
              ? theme.palette.warning.main
              : getNotificationColor(notification.type) === 'success'
              ? theme.palette.success.main
              : theme.palette.primary.main,
            0.1
          ),
          color: getNotificationColor(notification.type) === 'error'
            ? theme.palette.error.main
            : getNotificationColor(notification.type) === 'warning'
            ? theme.palette.warning.main
            : getNotificationColor(notification.type) === 'success'
            ? theme.palette.success.main
            : theme.palette.primary.main,
          fontSize: '1.2rem',
          width: 44,
          height: 44,
          border: `2px solid ${alpha(theme.palette.divider, 0.1)}`
        })}>
          {notification.icon || getNotificationIcon(notification.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{
          margin: 0,
          '& .MuiListItemText-primary': {
            marginBottom: 1.5
          },
        }}
        primary={
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  flex: 1,
                  mr: 2,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  lineHeight: 1.3,
                  color: 'text.primary'
                }}
              >
                {notification.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={notification.type.toUpperCase()}
                  size="small"
                  color={getNotificationColor(notification.type) as any}
                  variant="filled"
                  sx={{
                    fontSize: '0.625rem',
                    height: 20,
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
                <Stack direction="row" spacing={0.5}>
                  {!notification.read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        sx={(theme) => ({
                          p: 0.5,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main
                          }
                        })}
                      >
                        <MarkAsUnreadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(e, notification.id)}
                      sx={(theme) => ({
                        p: 0.5,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main
                        }
                      })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                lineHeight: 1.5,
                fontSize: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {notification.body}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  opacity: 0.8
                }}
              >
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </Typography>
              {notification.actionUrl && (
                <Typography
                  variant="caption"
                  color="primary.main"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  View Details →
                </Typography>
              )}
            </Box>
          </Box>
        }
      />
    </NotificationItem>
  ));

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="notifications"
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <StyledMenu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <NotificationHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              })}
            >
              <NotificationsIcon sx={{ color: 'white', fontSize: '1.1rem' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  mb: 0,
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em'
                }}
              >
                Notifications
              </Typography>
              {unreadCount > 0 ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 0.125
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem', fontWeight: 500, mt: 0.125 }}
                >
                  You're all caught up!
                </Typography>
              )}
            </Box>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {isLoading && (
              <CircularProgress
                size={20}
                thickness={4}
                sx={{ color: 'primary.main' }}
              />
            )}
            <IconButton
              size="small"
              onClick={refreshNotifications}
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: alpha(theme.palette.action.hover, 0.5),
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.8),
                  transform: 'rotate(180deg) scale(1.05)',
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              })}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNotificationSettings}
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  transform: 'scale(1.05)',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              })}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Stack>
        </NotificationHeader>

        {/* Permission request */}
        {isSupported && !hasPermission && (
          <Box sx={{ p: 3 }}>
            <Alert
              severity="info"
              action={
                <Button color="primary" size="small" onClick={handleRequestPermission}>
                  Enable
                </Button>
              }
              sx={{ borderRadius: 2 }}
            >
              Enable notifications to stay updated
            </Alert>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          </Box>
        )}

        {/* Notifications list */}
        {displayNotifications.length > 0 ? (
          notificationList
        ) : (
          <EmptyState>
            <NotificationsNoneIcon sx={{
              fontSize: 56,
              color: 'text.disabled',
              opacity: 0.6
            }} />
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
              No new notifications at the moment
            </Typography>
          </EmptyState>
        )}

        {displayNotifications.length > 0 && notifications.length > maxNotifications && (
          <MenuItem onClick={handleViewAllNotifications}>
            <Typography variant="body2" color="primary" textAlign="center" width="100%">
              View all {notifications.length} notifications
            </Typography>
          </MenuItem>
        )}

        {/* Actions */}
        {displayNotifications.length > 0 && (
          <NotificationActions>
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              sx={{
                fontWeight: 500,
                textTransform: 'none',
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              Mark all as read
            </Button>
            <Stack direction="row" spacing={1}>
              {currentUserId && (
                <Button
                  size="small"
                  startIcon={<SettingsIcon fontSize="small" />}
                  onClick={handleNotificationSettings}
                  sx={{
                    fontWeight: 500,
                    textTransform: 'none',
                  }}
                >
                  Settings
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                onClick={handleViewAllNotifications}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }
                }}
              >
                View All
              </Button>
            </Stack>
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
          PaperProps={{
            sx: {
              borderRadius: 3,
              minHeight: '70vh',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notification Settings
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <NotificationSettings
              userId={currentUserId}
              onSave={() => {
                // Optionally refresh notifications
                refreshNotifications();
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setSettingsOpen(false)}
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default NotificationBell;
