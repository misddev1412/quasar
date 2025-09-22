import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Divider,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface UserInfoProps {
  collapsed?: boolean;
}

const UserInfoContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed'
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  marginTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(5px)',
}));

const UserInfoContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed'
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  paddingLeft: collapsed ? theme.spacing(1) : theme.spacing(3),
  paddingRight: collapsed ? theme.spacing(1) : theme.spacing(3),
  justifyContent: collapsed ? 'center' : 'flex-start',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.2s',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  '&:hover': {
    boxShadow: `0 0 0 2px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
  }
}));

const UserInfo: React.FC<UserInfoProps> = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslationWithBackend();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };
  if (!user) {
    return (
      <UserInfoContainer collapsed={collapsed}>
        <UserInfoContent collapsed={collapsed}>
          <Tooltip title={t('userInfo.notLoggedIn', 'Not logged in')}>
            <AccountCircleIcon color="disabled" />
          </Tooltip>
        </UserInfoContent>
      </UserInfoContainer>
    );
  }

  const getUserInitial = () => {
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };
  return (
    <UserInfoContainer collapsed={collapsed}>
      <UserInfoContent collapsed={collapsed}>
        <Tooltip title={collapsed ? user.username || user.email : ''}>
          <UserAvatar
            onClick={handleClick}
            sx={{ cursor: 'pointer', mx: collapsed ? 'auto' : 0 }}
          >
            <PersonIcon fontSize="small" />
          </UserAvatar>
        </Tooltip>

        {!collapsed && (
          <>
            <Box sx={{ ml: 2, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'medium' }}>
                {user.username || user.email}
              </Typography>
              {user.username && user.email && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              )}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton
              size="small"
              onClick={handleClick}
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              sx={{ color: 'text.secondary' }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </UserInfoContent>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            width: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          {t('userInfo.profile', 'Profile')}
        </MenuItem>

        <MenuItem component={Link} to="/settings" onClick={handleClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {t('userInfo.settings', 'Settings')}
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          {t('userInfo.helpCenter', 'Help Center')}
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('userInfo.logout', 'Logout')}
        </MenuItem>
      </Menu>
    </UserInfoContainer>
  );
};

export default UserInfo; 