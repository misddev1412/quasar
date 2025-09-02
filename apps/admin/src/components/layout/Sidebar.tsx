import React, { useState } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import UserInfo from './UserInfo';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Tooltip,
  Typography,
  Collapse,
  useTheme as useMuiTheme,
  Avatar,
  Badge,
  InputBase,
  Paper,
  alpha,
  Popper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  // 已移除不再使用的MUI组件导入
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SecurityIcon from '@mui/icons-material/Security';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewListIcon from '@mui/icons-material/ViewList';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PublicIcon from '@mui/icons-material/Public';
import StorageIcon from '@mui/icons-material/Storage';
// 移除了不再需要的图标导入
import { styled } from '@mui/material/styles';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface SubMenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
  subItems?: SubMenuItem[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SearchResult {
  icon: React.ReactNode;
  label: string;
  path: string;
  group?: string;
}

// 已移除快速操作项接口

// 自定义侧边栏样式
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 250,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: 250,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
    overflowX: 'hidden',
  },
}));

// 收缩后的侧边栏
const StyledMiniDrawer = styled(Drawer)(({ theme }) => ({
  width: 70,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: 70,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
    overflowX: 'hidden',
  },
}));

// 自定义列表项按钮
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark'
      ? `rgba(59, 130, 246, 0.15)`
      : `rgba(59, 130, 246, 0.1)`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 0 1px rgba(59, 130, 246, 0.3)'
      : '0 0 0 1px rgba(59, 130, 246, 0.2)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? `rgba(59, 130, 246, 0.2)`
        : `rgba(59, 130, 246, 0.15)`,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 0 0 1px rgba(59, 130, 246, 0.4)'
        : '0 0 0 1px rgba(59, 130, 246, 0.3)',
    },
    color: theme.palette.mode === 'dark'
      ? theme.palette.common.white
      : theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.04)',
  }
}));

// 徽章组件
const MenuBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -2,
    top: 4,
    border: `1.5px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: '600',
    fontSize: '0.65rem',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 2px 4px rgba(0, 0, 0, 0.3)'
      : '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
}));

// 分组标题样式
const GroupTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: theme.spacing(1.5, 3),
  color: theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[600],
}));

// 主题切换按钮
const ThemeToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 70, // 在Logo下面一点
  right: theme.spacing(1),
  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
}));

// 搜索框样式
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.08 : 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.12 : 0.25),
  },
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  width: '90%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.875rem',
  },
}));

const SearchResultItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1.5),
    fontSize: '1.25rem',
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
  }
}));

const SearchResultGroup = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  padding: theme.spacing(0.75, 2),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  color: theme.palette.text.secondary,
}));

// 已移除快速操作按钮容器样式

const Sidebar: React.FC = () => {
  const { config, toggleSidebar } = useLayout();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed } = config;
  const { t } = useTranslationWithBackend();
  const { logout } = useAuth();
  
  // 处理登出
  const handleLogout = () => {
    logout();
  };
  
  // 搜索相关状态
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  
  const [menuCollapseState, setMenuCollapseState] = useState<Record<string, boolean>>({});

  // 菜单分组
  const menuGroups: MenuGroup[] = [
    {
      title: t('navigation.overview', '概览'),
      items: [
        {
          icon: <DashboardIcon />,
          label: t('navigation.dashboard', '仪表盘'),
          path: '/'
        }
      ]
    },
    {
      title: t('navigation.content_management', '内容管理'),
      items: [
        {
          icon: <PeopleIcon />,
          label: t('admin.user_management', '用户管理'),
          path: '/users-management',
          badge: 2,
          subItems: [
            {
              icon: <PermIdentityIcon />,
              label: t('admin.user_list', '用户列表'),
              path: '/users',
              badge: 2
            },
            {
              icon: <ManageAccountsIcon />,
              label: t('admin.manage_roles', '角色管理'),
              path: '/roles'
            },
            {
              icon: <SecurityIcon />,
              label: t('admin.manage_permissions', '权限设置'),
              path: '/permissions'
            }
          ]
        },
        {
          icon: <DescriptionIcon />,
          label: t('admin.seo_management', 'SEO管理'),
          path: '/seo',
        },
        {
          icon: <EmailIcon />,
          label: t('admin.mail_templates', 'Mail Templates'),
          path: '/mail-templates',
        },
        {
          icon: <ArticleIcon />,
          label: t('admin.posts_management', 'Posts Management'),
          path: '/posts-management',
          subItems: [
            {
              icon: <ViewListIcon />,
              label: t('admin.posts_list', 'Posts List'),
              path: '/posts'
            },
            {
              icon: <CreateIcon />,
              label: t('admin.create_post', 'Create Post'),
              path: '/posts/create'
            },
            {
              icon: <CategoryIcon />,
              label: t('admin.categories', 'Categories'),
              path: '/posts/categories'
            },
            {
              icon: <LocalOfferIcon />,
              label: t('admin.tags', 'Tags'),
              path: '/posts/tags'
            }
          ]
        }
      ]
    },
    {
      title: t('navigation.communication', '通信'),
      items: [
        {
          icon: <NotificationsIcon />,
          label: t('navigation.notifications', '通知'),
          path: '/notifications',
          badge: 5
        },
        {
          icon: <ChatIcon />,
          label: t('navigation.messages', '消息'),
          path: '/messages',
          badge: 3
        },
        {
          icon: <LanguageIcon />,
          label: t('admin.translations', '翻译'),
          path: '/translations'
        }
      ]
    },
    {
      title: t('navigation.system', '系统'),
      items: [
        {
          icon: <PublicIcon />,
          label: t('languages.languages', '语言管理'),
          path: '/languages'
        },
        {
          icon: <StorageIcon />,
          label: t('navigation.storage', 'Storage Configuration'),
          path: '/storage'
        },
        {
          icon: <SettingsIcon />,
          label: t('navigation.settings', '设置'),
          path: '/settings'
        },
        {
          icon: <HelpIcon />,
          label: t('navigation.help', '帮助'),
          path: '/help'
        }
      ]
    }
  ];

  // 从菜单组获取所有可搜索项
  const getAllSearchableItems = (): SearchResult[] => {
    let results: SearchResult[] = [];
    
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        // 添加主菜单项
        results.push({
          icon: item.icon,
          label: item.label,
          path: item.path,
          group: group.title
        });
        
        // 添加子菜单项
        if (item.subItems) {
          item.subItems.forEach(subItem => {
            results.push({
              icon: subItem.icon,
              label: `${item.label} > ${subItem.label}`,
              path: subItem.path,
              group: group.title
            });
          });
        }
      });
    });
    
    return results;
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    // 获取所有菜单项
    const allItems = getAllSearchableItems();
    
    // 执行搜索，根据关键词匹配标签
    const results = allItems.filter(item => 
      item.label.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  // 处理搜索结果点击
  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setSearchValue('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };
  
  // 处理搜索框聚焦和失焦
  const handleSearchFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsSearchFocused(true);
    setSearchAnchorEl(event.currentTarget.parentElement || null);
  };
  
  const handleSearchBlur = () => {
    // 使用setTimeout允许点击搜索结果
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  // 检查路由是否活跃
  const isActiveRoute = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    
    // For parent menu items that are just grouping paths (like /posts-management), 
    // they should not be active unless explicitly navigated to
    if (path.endsWith('-management')) {
      return location.pathname === path;
    }
    
    // For specific routes that should only match exactly
    const exactMatchPaths = ['/users', '/roles', '/permissions', '/posts', '/settings', '/seo', '/languages'];
    if (exactMatchPaths.includes(path)) {
      return location.pathname === path;
    }
    
    // For other paths, use startsWith for nested routes
    return location.pathname.startsWith(path);
  };

  // 检查是否应该展开子菜单
  const isSubmenuExpanded = (item: MenuItem): boolean => {
    if (!item.subItems) return false;
  
    const manualState = menuCollapseState[item.path];
    if (manualState !== undefined) {
      return manualState;
    }
  
    // 默认行为：如果子菜单是激活的，就展开
    return item.subItems.some(subItem => isActiveRoute(subItem.path));
  };

  // 处理子菜单展开/折叠
  const handleToggleSubMenu = (item: MenuItem) => {
    const isExpanded = isSubmenuExpanded(item);
    setMenuCollapseState(prevState => ({
      ...prevState,
      [item.path]: !isExpanded
    }));
  };

  // 计算子菜单未读消息总数
  const getSubItemsTotalBadge = (subItems?: SubMenuItem[]): number => {
    if (!subItems) return 0;
    return subItems.reduce((total, subItem) => total + (subItem.badge || 0), 0);
  };

  const renderMenuItemIcon = (item: MenuItem | SubMenuItem) => {
    const icon = item.icon;
    const badge = item.badge;
    
    if (!badge) return icon;
    
    return (
      <MenuBadge badgeContent={badge} color="error">
        {icon}
      </MenuBadge>
    );
  };

  // 渲染单个菜单项
  const renderMenuItem = (item: MenuItem, index: number) => {
    const isActive = isActiveRoute(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = isSubmenuExpanded(item);
    const badgeContent = hasSubItems ? getSubItemsTotalBadge(item.subItems) : item.badge;

    // Check if any sub-item is active (for parent highlighting in collapsed mode)
    const hasActiveSubItem = hasSubItems && item.subItems.some(subItem => isActiveRoute(subItem.path));
    const shouldHighlightParent = sidebarCollapsed && hasActiveSubItem;
    
    return (
      <React.Fragment key={index}>
        <ListItem disablePadding sx={{
          display: 'block',
          mb: hasSubItems && sidebarCollapsed ? 0.5 : (hasSubItems ? 0 : 0.5)
        }}>
          {hasSubItems ? (
            <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
              <StyledListItemButton
                onClick={() => !sidebarCollapsed && handleToggleSubMenu(item)}
                selected={isActive || shouldHighlightParent}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarCollapsed ? 'center' : 'initial',
                  px: sidebarCollapsed ? 1 : 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  // Enhanced indicator for parent with active sub-items in collapsed mode
                  ...(sidebarCollapsed && hasActiveSubItem && {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      backgroundColor: 'primary.main',
                      borderRadius: '0 2px 2px 0',
                      zIndex: 1,
                    }
                  })
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarCollapsed ? 0 : 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    width: sidebarCollapsed ? '100%' : 'auto',
                    color: (isActive || shouldHighlightParent)
                      ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                      : 'text.secondary',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.25rem',
                    },
                  }}
                >
                  {badgeContent > 0 ? (
                    <MenuBadge badgeContent={badgeContent} color="error">
                      {item.icon}
                    </MenuBadge>
                  ) : item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: (isActive || shouldHighlightParent) ? 'medium' : 'normal',
                      }}
                      sx={{
                        opacity: sidebarCollapsed ? 0 : 1,
                        color: (isActive || shouldHighlightParent)
                          ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                          : 'text.primary',
                      }}
                    />
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </>
                )}
              </StyledListItemButton>
            </Tooltip>
          ) : (
            <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
              <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <StyledListItemButton
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: sidebarCollapsed ? 'center' : 'initial',
                    px: sidebarCollapsed ? 1 : 2.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarCollapsed ? 0 : 3,
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                      width: sidebarCollapsed ? '100%' : 'auto',
                      color: isActive
                        ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                        : 'text.secondary',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                      },
                    }}
                  >
                    {badgeContent > 0 ? (
                      <MenuBadge badgeContent={badgeContent} color="error">
                        {item.icon}
                      </MenuBadge>
                    ) : item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: isActive ? 'medium' : 'normal',
                      }}
                      sx={{ 
                        opacity: sidebarCollapsed ? 0 : 1,
                        color: isActive
                          ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                          : 'text.primary',
                      }} 
                    />
                  )}
                </StyledListItemButton>
              </Link>
            </Tooltip>
          )}
        </ListItem>
        
        {/* 子菜单 */}
        {hasSubItems && !sidebarCollapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem, subIndex) => {
                const isSubItemActive = isActiveRoute(subItem.path);
                
                return (
                  <Link 
                    key={subIndex}
                    to={subItem.path} 
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <StyledListItemButton
                      selected={isSubItemActive}
                      sx={{
                        pl: 6,
                        py: 0.75,
                        minHeight: 38,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: 2,
                          justifyContent: 'center',
                          color: isSubItemActive
                            ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                            : 'text.secondary',
                          fontSize: '0.875rem',
                        }}
                      >
                        {subItem.badge ? (
                          <MenuBadge badgeContent={subItem.badge} color="error">
                            {subItem.icon}
                          </MenuBadge>
                        ) : subItem.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={subItem.label} 
                        primaryTypographyProps={{ 
                          fontSize: 13,
                          fontWeight: isSubItemActive ? 'medium' : 'normal',
                        }}
                        sx={{
                          color: isSubItemActive
                            ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                            : 'text.primary',
                        }}
                      />
                    </StyledListItemButton>
                  </Link>
                );
              })}
            </List>
          </Collapse>
        )}
        
        {/* Professional sub-menu display in collapsed state */}
        {hasSubItems && sidebarCollapsed && (
          <Box sx={{
            mt: 0.5,
            mb: 1,
            position: 'relative',
          }}>
            {item.subItems.map((subItem, subIndex) => {
              const isSubItemActive = isActiveRoute(subItem.path);

              return (
                <Tooltip
                  key={subIndex}
                  title={subItem.label}
                  placement="right"
                  arrow
                >
                  <Link
                    to={subItem.path}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <StyledListItemButton
                      selected={isSubItemActive}
                      sx={{
                        justifyContent: 'center',
                        minHeight: 36,
                        mt: subIndex === 0 ? 0 : 0.5,
                        mx: 1,
                        px: 0.5,
                        position: 'relative',
                        borderRadius: '6px',
                        // Professional visual distinction for sub-items
                        border: theme => `1px solid ${
                          isSubItemActive
                            ? 'transparent'
                            : theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.08)'
                        }`,
                        backgroundColor: theme =>
                          isSubItemActive
                            ? undefined // Let StyledListItemButton handle selected state
                            : theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.02)'
                              : 'rgba(0, 0, 0, 0.02)',
                        // Subtle left border indicator
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          bottom: '20%',
                          width: '2px',
                          backgroundColor: isSubItemActive
                            ? 'primary.main'
                            : theme => theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'rgba(0, 0, 0, 0.15)',
                          borderRadius: '0 1px 1px 0',
                          opacity: isSubItemActive ? 1 : 0.6,
                        },
                        '&:hover': {
                          backgroundColor: theme =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.05)',
                          '&::before': {
                            opacity: 1,
                          }
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                          display: 'flex',
                          width: '100%',
                          color: isSubItemActive
                            ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                            : 'text.secondary',
                          '& .MuiSvgIcon-root': {
                            fontSize: '1.1rem',
                            opacity: isSubItemActive ? 1 : 0.8,
                          },
                        }}
                      >
                        {subItem.badge ? (
                          <MenuBadge badgeContent={subItem.badge} color="error">
                            {subItem.icon}
                          </MenuBadge>
                        ) : subItem.icon}
                      </ListItemIcon>
                    </StyledListItemButton>
                  </Link>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </React.Fragment>
    );
  };
  
  // 渲染搜索结果
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      if (searchValue.trim().length > 0) {
        return (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">没有匹配的结果</Typography>
          </Box>
        );
      }
      return null;
    }

    // 按组分类结果
    const groupedResults: { [key: string]: SearchResult[] } = {};
    searchResults.forEach(result => {
      const group = result.group || '其他';
      if (!groupedResults[group]) {
        groupedResults[group] = [];
      }
      groupedResults[group].push(result);
    });

    return (
      <MenuList>
        {Object.entries(groupedResults).map(([group, items], index) => (
          <React.Fragment key={index}>
            <SearchResultGroup>{group}</SearchResultGroup>
            {items.map((result, idx) => (
              <SearchResultItem 
                key={idx} 
                onClick={() => handleSearchResultClick(result.path)}
              >
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  {result.icon}
                  <Typography sx={{ ml: 1.5, fontSize: '0.875rem' }}>
                    {result.label}
                  </Typography>
                </Box>
                <KeyboardArrowRightIcon fontSize="small" color="action" />
              </SearchResultItem>
            ))}
          </React.Fragment>
        ))}
      </MenuList>
    );
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Logo和收缩按钮 */}
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
          <Tooltip title="收起侧边栏">
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

      {/* 移动展开按钮到Logo下方的单独行 */}
      {sidebarCollapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
          <Tooltip title="展开侧边栏" placement="right">
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
      
      {/* 搜索框 - 非折叠状态 */}
      {!sidebarCollapsed && (
        <>
          <Search>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" color="action" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="搜索…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchValue}
              onChange={handleSearch}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </Search>
          <Popper
            open={isSearchFocused && searchResults.length > 0}
            anchorEl={searchAnchorEl}
            placement="bottom-start"
            style={{ width: searchAnchorEl?.offsetWidth, zIndex: 1300 }}
          >
            <Paper elevation={3} sx={{ mt: 0.5, maxHeight: 320, overflow: 'auto' }}>
              {renderSearchResults()}
            </Paper>
          </Popper>
        </>
      )}
      
      {/* 搜索图标 - 折叠状态 */}
      {sidebarCollapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
          <Tooltip title="搜索" placement="right">
            <IconButton
              onClick={() => {
                // 在折叠状态下点击搜索图标展开侧边栏
                toggleSidebar();
                // 延迟一下聚焦搜索框，让侧边栏先展开
                setTimeout(() => {
                  const searchInput = document.querySelector('input[aria-label="search"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                  }
                }, 300);
              }}
              sx={{
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                color: theme => theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700],
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
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {/* 主题切换按钮 */}
      {sidebarCollapsed ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
          <Tooltip title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"} placement="right">
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
              primary={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"} 
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </StyledListItemButton>
        </Box>
      )}
      
      <Divider sx={{ my: 0.5 }} />

      {/* 导航菜单 */}
      <Box sx={{ overflow: 'auto', flexGrow: 1, pb: 8 }}>
        {menuGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {/* 分组标题 - 在非折叠状态下才显示 */}
            {!sidebarCollapsed && (
              <Box sx={{ mt: groupIndex === 0 ? 1 : 3, mb: 0.5 }}>
                <GroupTitle>{group.title}</GroupTitle>
              </Box>
            )}
            
            {/* 如果是第一个分组且折叠状态，添加一点上边距 */}
            {sidebarCollapsed && groupIndex === 0 && <Box sx={{ mt: 1 }} />}
            
            {/* 分组中的菜单项 */}
            <List sx={{ 
              pt: 0.5, 
              pb: 0.5,
              // 如果折叠状态且不是第一个分组，添加细分隔线
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

      {/* 用户资料区域 - 使用新的UserInfo组件 */}
      <UserInfo collapsed={sidebarCollapsed} />
    </Box>
  );

  // 已移除快速操作悬浮按钮的渲染函数

  // 根据收缩状态渲染不同宽度的侧边栏
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