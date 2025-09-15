import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import Logo from './Logo';
import UserInfo from './UserInfo';
import {
  List,
  Divider,
  IconButton,
  Box,
  Tooltip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// Domain services
import { NavigationService } from '../../domains/navigation/services/NavigationService';
import { INavigationService } from '../../domains/navigation/interfaces/INavigationService';

// Presentation components
import SidebarSearch from './sidebar/components/SidebarSearch';
import SidebarMenuItem from './sidebar/components/SidebarMenuItem';

// Styles
import {
  StyledDrawer,
  StyledMiniDrawer,
  StyledListItemButton,
  GroupTitle,
} from './sidebar/styles/SidebarStyles';


const Sidebar: React.FC = () => {
  const { config, toggleSidebar } = useLayout();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const { sidebarCollapsed } = config;
  const { t } = useTranslationWithBackend();
  const { logout } = useAuth();
  
  // Domain services
  const navigationService: INavigationService = new NavigationService(t);
  
  // State
  const [menuCollapseState, setMenuCollapseState] = useState<Record<string, boolean>>({});
  
  // Get menu configuration from domain service
  const menuGroups = navigationService.getMenuGroups();

  // Delegate menu logic to domain service
  const isActiveRoute = (path: string): boolean => {
    return navigationService.isActiveRoute(path, location.pathname);
  };

  const isSubmenuExpanded = (item: any): boolean => {
    return navigationService.isSubmenuExpanded(item, menuCollapseState, location.pathname);
  };

  const handleToggleSubMenu = (item: any) => {
    const newState = navigationService.toggleSubMenu(item, menuCollapseState);
    setMenuCollapseState(newState);
  };

  const getSubItemsTotalBadge = (subItems?: any[]): number => {
    return navigationService.getSubItemsTotalBadge(subItems);
  };

  // Render menu item using the new component
  const renderMenuItem = (item: any, index: number) => {
    const isActive = isActiveRoute(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = isSubmenuExpanded(item);
    const badgeContent = hasSubItems ? getSubItemsTotalBadge(item.subItems) : item.badge;
    const hasActiveSubItem = hasSubItems && item.subItems.some((subItem: any) => isActiveRoute(subItem.path));

    return (
      <SidebarMenuItem
        key={index}
        item={item}
        isActive={isActive}
        isExpanded={isExpanded}
        collapsed={sidebarCollapsed}
        badgeContent={badgeContent}
        hasActiveSubItem={hasActiveSubItem}
        onToggleSubMenu={() => handleToggleSubMenu(item)}
        onSubItemActiveCheck={isActiveRoute}
      />
    );
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Logo and collapse button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: sidebarCollapsed ? 0 : 2,
        height: '64px', 
        position: 'relative'
      }}>
        <Logo collapsed={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <Tooltip title={t('sidebar.collapseSidebar', 'Collapse Sidebar')}>
            <IconButton 
              onClick={toggleSidebar} 
              size="small" 
              sx={{ 
                color: 'text.secondary',
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover',
                },
                width: 32,
                height: 32,
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                border: theme => `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Move expand button to separate line below Logo */}
      {sidebarCollapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
          <Tooltip title={t('sidebar.expandSidebar', 'Expand Sidebar')} placement="right">
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: 'text.primary',
                backgroundColor: theme => theme.palette.background.paper,
                border: theme => `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]}`,
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: theme => theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[100],
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Divider />
      
      {/* Search Component */}
      <SidebarSearch
        menuGroups={menuGroups}
        collapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />
      
      {/* Theme toggle button */}
      {sidebarCollapsed ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
          <Tooltip title={isDarkMode ? t('sidebar.switchToLightMode', 'Switch to Light Mode') : t('sidebar.switchToDarkMode', 'Switch to Dark Mode')} placement="right">
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                color: theme => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                },
              }}
              size="small"
            >
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ mx: 2, my: 1 }}>
          <StyledListItemButton
            onClick={toggleDarkMode}
            sx={{
              minHeight: 44,
              borderRadius: 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 3, color: 'text.secondary' }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText 
              primary={isDarkMode ? t('sidebar.switchToLightMode', 'Switch to Light Mode') : t('sidebar.switchToDarkMode', 'Switch to Dark Mode')} 
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </StyledListItemButton>
        </Box>
      )}
      
      <Divider sx={{ my: 0.5 }} />

      {/* Navigation menu */}
      <Box sx={{ overflow: 'auto', flexGrow: 1, pb: 8 }}>
        {menuGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {/* Group title - only show in expanded state */}
            {!sidebarCollapsed && (
              <Box sx={{ mt: groupIndex === 0 ? 1 : 3, mb: 0.5 }}>
                <GroupTitle>{group.title}</GroupTitle>
              </Box>
            )}
            
            {/* Add top margin if first group and collapsed */}
            {sidebarCollapsed && groupIndex === 0 && <Box sx={{ mt: 1 }} />}
            
            {/* Menu items in group */}
            <List sx={{ 
              pt: 0.5, 
              pb: 0.5,
              // Add separator line if collapsed and not first group
              ...(sidebarCollapsed && groupIndex > 0 ? {
                borderTop: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                pt: 1.5,
                mt: 1.5,
              } : {})
            }}>
              {group.items.map((item, index) => renderMenuItem(item, index))}
            </List>
          </React.Fragment>
        ))}
      </Box>

      {/* User profile area - using new UserInfo component */}
      <UserInfo collapsed={sidebarCollapsed} />
    </Box>
  );

  // Removed quick action floating button render function

  // Render different width sidebar based on collapsed state
  return (
    <>
      {sidebarCollapsed ? (
        <StyledMiniDrawer
          variant="permanent"
          open={false}
        >
          {drawer}
        </StyledMiniDrawer>
      ) : (
        <StyledDrawer
          variant="permanent"
          open={true}
        >
          {drawer}
        </StyledDrawer>
      )}
    </>
  );
};

export default Sidebar; 