import React, { useState } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Box,
  Typography,
  Stack,
  Tooltip,
  Divider,
  useTheme as useMuiTheme,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

// Optimized search box style
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: `${Number(theme.shape.borderRadius) * 2}px`, // Convert to number and multiply by 2
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.12),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.2s',
  display: 'flex', // Ensure internal elements are properly aligned
  alignItems: 'center', // Vertical centering
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  zIndex: 1, // Ensure icon is displayed above the input field
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
    fontSize: '0.875rem',
  },
}));

// Optimized avatar style
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 0 0 2px ' + alpha(theme.palette.primary.main, 0.3),
  }
}));

// Optimized icon buttons
const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  backgroundColor: 'transparent',
  transition: 'all 0.2s',
  borderRadius: '50%', // Perfectly round
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  }
}));

// New dark mode toggle button style
const ThemeToggleButton = styled(Box)(({ theme }) => ({
  width: '36px', 
  height: '36px', 
  minWidth: '36px', // Ensure minimum width
  minHeight: '36px', // Ensure minimum height
  maxWidth: '36px', // Ensure maximum width
  maxHeight: '36px', // Ensure maximum height
  borderRadius: '50%', 
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.grey[300], 0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  flexShrink: 0, // Prevent compression
  flexGrow: 0, // Prevent stretching
  boxShadow: theme.palette.mode === 'dark' 
    ? `0 0 8px 2px ${alpha(theme.palette.primary.main, 0.3)}` 
    : `0 2px 5px 0px ${alpha(theme.palette.grey[500], 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark' 
      ? `0 0 12px 3px ${alpha(theme.palette.primary.main, 0.4)}` 
      : `0 2px 8px 0px ${alpha(theme.palette.grey[500], 0.3)}`,
  }
}));

const Header: React.FC = () => {
  const { config, toggleLayoutType } = useLayout();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const muiTheme = useMuiTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // User dropdown menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchor);

  // Handle user menu open
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    handleUserMenuClose();
    navigate(path);
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{
        backgroundColor: isDarkMode ? 'grey.900' : 'background.paper',
        borderBottom: 1,
        borderColor: isDarkMode ? 'grey.800' : 'grey.200',
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        {/* Left section */}
        <Tooltip title={t(config.type === 'vertical' ? 'header.toggleToHorizontal' : 'header.toggleToVertical')}>
          <ActionButton
            edge="start"
            color="inherit"
            aria-label="toggle layout"
            onClick={toggleLayoutType}
            size="small"
            sx={{ borderRadius: '50%' }} // Ensure perfectly round
          >
            {config.type === 'vertical' ? <ViewSidebarIcon fontSize="small" /> : <ViewComfyIcon fontSize="small" />}
          </ActionButton>
        </Tooltip>

        {/* Search box */}
        <Search sx={{ display: { xs: 'none', md: 'flex' } }}>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder={t('header.search')}
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right section */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Documentation button */}
          <Tooltip title={t('header.documentation')}>
            <ActionButton size="small" sx={{ borderRadius: '50%' }}>
              <MenuBookIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          {/* Help button */}
          <Tooltip title={t('header.help')}>
            <ActionButton size="small" sx={{ borderRadius: '50%' }}>
              <HelpOutlineIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          {/* Dark mode toggle - new style */}
          <Tooltip title={isDarkMode ? t('header.switchToLightMode') : t('header.switchToDarkMode')}>
            <ThemeToggleButton 
              onClick={toggleDarkMode} 
              sx={{ 
                width: '36px !important', 
                height: '36px !important',
                minWidth: '36px !important',
                minHeight: '36px !important',
                maxWidth: '36px !important',
                maxHeight: '36px !important',
                borderRadius: '50% !important',
                aspectRatio: '1 / 1', // Force aspect ratio 1:1
                flexShrink: 0,
                flexGrow: 0
              }}
            >
              {isDarkMode ? (
                <Brightness7Icon 
                  fontSize="small" 
                  sx={{ 
                    color: 'primary.light', 
                    animation: 'fadeIn 0.5s', 
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0, transform: 'scale(0.5) rotate(-20deg)' },
                      '100%': { opacity: 1, transform: 'scale(1) rotate(0)' }
                    }
                  }} 
                />
              ) : (
                <Brightness4Icon 
                  fontSize="small" 
                  sx={{ 
                    color: 'text.primary', 
                    animation: 'fadeIn 0.5s',
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0, transform: 'scale(0.5) rotate(20deg)' },
                      '100%': { opacity: 1, transform: 'scale(1) rotate(0)' }
                    }
                  }} 
                />
              )}
            </ThemeToggleButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: '24px', alignSelf: 'center' }} />
          
          {/* Language switcher - enhanced design */}
          <Box 
            sx={{ 
              minWidth: 130,
              '& .locale-switcher': {
                height: '36px'
              },
              '& select': {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#e5e7eb' : '#374151',
                fontSize: '14px',
                padding: '6px 12px',
                height: '36px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                },
                '&:focus': {
                  outline: 'none',
                  borderColor: isDarkMode ? '#3b82f6' : '#3b82f6',
                  boxShadow: isDarkMode 
                    ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
                    : '0 0 0 3px rgba(59, 130, 246, 0.1)',
                }
              }
            }}
          >
            <LocaleSwitcher className="header-locale-switcher" />
          </Box>
          
          {/* Notifications */}
          <Tooltip title={t('header.notifications')}>
            <ActionButton size="small" sx={{ borderRadius: '50%' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </ActionButton>
          </Tooltip>
          
          {/* User avatar with dropdown */}
          <Tooltip title={user?.username || user?.email || t('header.userSettings')}>
            <StyledAvatar
              sx={{ width: 32, height: 32, cursor: 'pointer' }}
              onClick={handleUserMenuClick}
              aria-controls={isUserMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen ? 'true' : undefined}
            >
              <PersonIcon fontSize="small" />
            </StyledAvatar>
          </Tooltip>

          {/* User dropdown menu */}
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            open={isUserMenuOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
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
            {/* Profile */}
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              {t('navigation.profile')}
            </MenuItem>

            {/* Settings */}
            <MenuItem onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              {t('navigation.settings')}
            </MenuItem>

            {/* Help */}
            <MenuItem onClick={() => handleNavigation('/help')}>
              <ListItemIcon>
                <HelpOutlineIcon fontSize="small" />
              </ListItemIcon>
              {t('navigation.help')}
            </MenuItem>

            <Divider />

            {/* Logout */}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {t('navigation.logout')}
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 