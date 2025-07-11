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
import { Link } from 'react-router-dom';

interface UserInfoProps {
  collapsed?: boolean;
}

const UserInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(5px)',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  border: `2px solid ${theme.palette.primary.main}`,
}));

const UserInfo: React.FC<UserInfoProps> = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 处理菜单打开
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 处理退出登录
  const handleLogout = () => {
    handleClose();
    logout();
  };

  // 如果用户未定义，显示空状态
  if (!user) {
    return (
      <UserInfoContainer sx={{ justifyContent: 'center' }}>
        <Tooltip title="未登录">
          <AccountCircleIcon color="disabled" />
        </Tooltip>
      </UserInfoContainer>
    );
  }

  // 获取用户名首字母或用户名
  const getUserInitial = () => {
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // 显示完整或收缩状态的用户信息
  return (
    <UserInfoContainer sx={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
      <Tooltip title={collapsed ? user.username || user.email : ''}>
        <UserAvatar
          onClick={handleClick}
          sx={{ cursor: 'pointer', mx: collapsed ? 'auto' : 0 }}
        >
          {getUserInitial()}
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
          个人资料
        </MenuItem>

        <MenuItem component={Link} to="/settings" onClick={handleClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          设置
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          帮助中心
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          退出登录
        </MenuItem>
      </Menu>
    </UserInfoContainer>
  );
};

export default UserInfo; 