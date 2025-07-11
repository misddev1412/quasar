import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
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
  useTheme as useMuiTheme
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
import LocaleSwitcher from '../LocaleSwitcher';
import { useTranslation } from 'react-i18next';

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
  const muiTheme = useMuiTheme();
  const { t } = useTranslation();

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
          
          {/* Language switcher - increased width */}
          <Box sx={{ minWidth: 120 }}>
            <LocaleSwitcher selectClassName="w-full" />
          </Box>
          
          {/* Notifications */}
          <Tooltip title={t('header.notifications')}>
            <ActionButton size="small" sx={{ borderRadius: '50%' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </ActionButton>
          </Tooltip>
          
          {/* User avatar */}
          <Tooltip title={t('header.userSettings')}>
            <StyledAvatar sx={{ width: 32, height: 32, cursor: 'pointer' }}>
              <PersonIcon fontSize="small" />
            </StyledAvatar>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 