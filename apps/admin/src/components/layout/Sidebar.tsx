import React, { useState, useRef, useEffect } from 'react';
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

  // Refs for scrolling to active menu items
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeMenuItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const lastPathnameRef = useRef<string | undefined>(undefined);
  const isUserExpandingRef = useRef<boolean>(false);
  const isProgrammaticExpandRef = useRef<boolean>(false);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const hasScrolledOnMountRef = useRef<boolean>(false);

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
    // Check if the item being expanded contains the active route
    const containsActiveItem = item.subItems?.some((subItem: any) => isActiveRoute(subItem.path));

    // Mark that user is expanding a menu (only scroll if it contains active item)
    isUserExpandingRef.current = !containsActiveItem;

    const newState = navigationService.toggleSubMenu(item, menuCollapseState);
    setMenuCollapseState(newState);
  };

  // Helper function to expand menu programmatically (without setting user expansion flag)
  const expandMenuProgrammatically = (item: any) => {
    isProgrammaticExpandRef.current = true;
    const newState = navigationService.toggleSubMenu(item, menuCollapseState);
    setMenuCollapseState(newState);
  };

  const getSubItemsTotalBadge = (subItems?: any[]): number => {
    return navigationService.getSubItemsTotalBadge(subItems);
  };

  // Create expanded nodes set from menuCollapseState
  const expandedNodes = new Set(
    Object.keys(menuCollapseState).filter(key => menuCollapseState[key])
  );

  // Function to scroll to an element
  const scrollToElement = (element: HTMLElement) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const elementTopRelativeToContainer = elementRect.top - containerRect.top + container.scrollTop;
    const elementHeight = elementRect.height;
    const containerHeight = containerRect.height;

    const targetScrollTop = elementTopRelativeToContainer - (containerHeight / 2) + (elementHeight / 2);

    container.scrollTo({
      top: Math.max(0, Math.min(targetScrollTop, container.scrollHeight - containerHeight)),
      behavior: 'smooth',
    });
  };

  // Function to register menu item ref and scroll if it's active
  const registerMenuItemRef = (path: string, element: HTMLElement | null) => {
    if (element) {
      activeMenuItemRefs.current.set(path, element);

      // If this is the active item and we haven't scrolled on mount yet, scroll to it
      if (isActiveRoute(path) && !hasScrolledOnMountRef.current && scrollContainerRef.current) {
        // Small delay to ensure container is ready
        setTimeout(() => {
          scrollToElement(element);
          hasScrolledOnMountRef.current = true;
        }, 100);
      }
    } else {
      activeMenuItemRefs.current.delete(path);
    }
  };

  // Helper function to recursively find active item path and parent
  const findActiveItemPath = (items: any[]): { path: string; parentPath?: string } | null => {
    for (const item of items) {
      if (isActiveRoute(item.path)) {
        return { path: item.path };
      }
      if (item.subItems) {
        const activeSubPath = findActiveItemPath(item.subItems);
        if (activeSubPath) {
          return { path: activeSubPath.path, parentPath: item.path };
        }
      }
    }
    return null;
  };

  // Scroll to active menu item on mount (fallback if registerMenuItemRef didn't trigger)
  useEffect(() => {
    if (hasScrolledOnMountRef.current) return;

    const attemptScroll = () => {
      // Find the active menu item path
      let activeItemInfo: { path: string; parentPath?: string } | null = null;
      for (const group of menuGroups) {
        const found = findActiveItemPath(group.items);
        if (found) {
          activeItemInfo = found;
          break;
        }
      }

      if (!activeItemInfo) return;

      const activePath = activeItemInfo.path;

      // Try to find the active element
      let activeElement: HTMLElement | null = activeMenuItemRefs.current.get(activePath) || null;

      if (!activeElement && scrollContainerRef.current) {
        activeElement = scrollContainerRef.current.querySelector(
          `[data-menu-path="${activePath}"]`
        ) as HTMLElement;
      }

      if (activeElement && scrollContainerRef.current) {
        scrollToElement(activeElement);
        hasScrolledOnMountRef.current = true;
      }
    };

    // Try multiple times with increasing delays
    const timeouts = [
      setTimeout(attemptScroll, 500),
      setTimeout(attemptScroll, 1000),
      setTimeout(attemptScroll, 1500),
    ];

    timeoutIdsRef.current.push(...timeouts);

    return () => {
      timeouts.forEach(id => clearTimeout(id));
    };
  }, []); // Only run on mount

  // Scroll to active menu item when location changes (but not on first mount)
  useEffect(() => {
    const pathnameChanged = lastPathnameRef.current !== location.pathname;
    const wasProgrammaticExpand = isProgrammaticExpandRef.current;
    lastPathnameRef.current = location.pathname;

    // Skip first mount - handled by separate useEffect
    if (!hasScrolledOnMountRef.current) {
      return;
    }

    // Only scroll if pathname changed, or if user expanded a menu containing active item
    // Don't scroll if user expanded a different menu
    if (!pathnameChanged && isUserExpandingRef.current && !wasProgrammaticExpand) {
      // Reset the flags after checking
      isUserExpandingRef.current = false;
      isProgrammaticExpandRef.current = false;
      return;
    }

    // If this is a programmatic expand (from scrollToActiveItem), allow scroll to continue
    // Also scroll when pathname changed
    const shouldScroll = pathnameChanged || wasProgrammaticExpand;

    // Reset user expanding flag
    isUserExpandingRef.current = false;

    // Don't scroll if pathname didn't change and it's not a programmatic expand
    if (!shouldScroll) {
      isProgrammaticExpandRef.current = false;
      return;
    }

    // Find the active menu item path
    let activeItemInfo: { path: string; parentPath?: string } | null = null;
    for (const group of menuGroups) {
      const found = findActiveItemPath(group.items);
      if (found) {
        activeItemInfo = found;
        break;
      }
    }

    if (!activeItemInfo) {
      isProgrammaticExpandRef.current = false;
      return;
    }

    const activePath = activeItemInfo.path;

    // Ensure parent menu is expanded if there's an active sub-item
    if (activeItemInfo.parentPath && !menuCollapseState[activeItemInfo.parentPath]) {
      // Find the parent item and expand it programmatically
      for (const group of menuGroups) {
        for (const item of group.items) {
          if (item.path === activeItemInfo.parentPath) {
            expandMenuProgrammatically(item);
            // Will retry after expansion via menuCollapseState change
            return;
          }
        }
      }
    }

    // Try to find the active element
    let activeElement: HTMLElement | null = activeMenuItemRefs.current.get(activePath) || null;

    if (!activeElement && scrollContainerRef.current) {
      activeElement = scrollContainerRef.current.querySelector(
        `[data-menu-path="${activePath}"]`
      ) as HTMLElement;
    }

    if (activeElement && scrollContainerRef.current) {
      scrollToElement(activeElement);
      isProgrammaticExpandRef.current = false;
    } else {
      // If element not found, try again after a short delay
      const timeoutId = setTimeout(() => {
        const retryElement = activeMenuItemRefs.current.get(activePath) ||
          scrollContainerRef.current?.querySelector(`[data-menu-path="${activePath}"]`) as HTMLElement;
        if (retryElement) {
          scrollToElement(retryElement);
        }
        isProgrammaticExpandRef.current = false;
      }, 300);
      timeoutIdsRef.current.push(timeoutId);
    }
  }, [location.pathname, menuGroups, sidebarCollapsed, menuCollapseState]);

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
        expandedNodes={expandedNodes}
        onRegisterRef={registerMenuItemRef}
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
      <Box ref={scrollContainerRef} sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pb: 8 }}>
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