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
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? `rgba(38, 99, 235, 0.2)` 
      : theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? `rgba(38, 99, 235, 0.3)` 
        : theme.palette.primary.light,
    },
    color: theme.palette.common.white,
  },
}));

// 徽章组件
const MenuBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 6,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: 'bold',
    fontSize: '0.6rem',
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
  
  // 追踪打开的子菜单
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  
  // 搜索相关状态
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  
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
          path: '/users',
          badge: 2,
          subItems: [
            {
              icon: <PermIdentityIcon />,
              label: t('admin.user_list', '用户列表'),
              path: '/users/list',
              badge: 2
            },
            {
              icon: <ManageAccountsIcon />,
              label: t('admin.manage_roles', '角色管理'),
              path: '/users/roles'
            },
            {
              icon: <SecurityIcon />,
              label: t('admin.manage_permissions', '权限设置'),
              path: '/users/permissions'
            }
          ]
        },
        {
          icon: <DescriptionIcon />,
          label: t('admin.seo_management', 'SEO管理'),
          path: '/seo',
          subItems: [
            {
              icon: <ViewListIcon />,
              label: t('admin.seo_list', 'SEO列表'),
              path: '/seo/list'
            },
            {
              icon: <BarChartIcon />,
              label: t('admin.seo_analytics', 'SEO分析'),
              path: '/seo/analytics'
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
    return location.pathname.startsWith(path);
  };

  // 处理子菜单展开/折叠
  const handleToggleSubMenu = (path: string) => {
    if (openSubMenu === path) {
      setOpenSubMenu(null);
    } else {
      setOpenSubMenu(path);
    }
  };

  // 检查是否应该展开子菜单
  const shouldExpandSubmenu = (item: MenuItem): boolean => {
    if (!item.subItems) return false;
    
    // 如果路径匹配子项，应该展开
    const hasActiveChild = item.subItems.some(subItem => isActiveRoute(subItem.path));
    
    // 如果手动展开或有活动的子项，则展开
    return openSubMenu === item.path || hasActiveChild;
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
    const isExpanded = shouldExpandSubmenu(item);
    const badgeContent = hasSubItems ? getSubItemsTotalBadge(item.subItems) : item.badge;
    
    return (
      <React.Fragment key={index}>
        <ListItem disablePadding sx={{ display: 'block', mb: hasSubItems ? 0 : 0.5 }}>
          {hasSubItems ? (
            <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
              <StyledListItemButton
                onClick={() => !sidebarCollapsed && handleToggleSubMenu(item.path)}
                selected={isActive && !item.subItems}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarCollapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                                    <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarCollapsed ? 'auto' : 3,
                    justifyContent: 'center',
                    color: isActive ? 'common.white' : 'text.secondary',
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
                        fontWeight: isActive ? 'medium' : 'normal',
                      }}
                      sx={{ 
                        opacity: sidebarCollapsed ? 0 : 1,
                        color: isActive ? 'common.white' : 'text.primary',
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
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarCollapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: isActive ? 'common.white' : 'text.secondary',
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
                        color: isActive ? 'common.white' : 'text.primary',
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
                          color: isSubItemActive ? 'common.white' : 'text.secondary',
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
                          color: isSubItemActive ? 'common.white' : 'text.primary',
                        }} 
                      />
                    </StyledListItemButton>
                  </Link>
                );
              })}
            </List>
          </Collapse>
        )}
        
        {/* 如果侧边栏折叠状态下有子菜单，则在悬停时显示子菜单 */}
        {hasSubItems && sidebarCollapsed && item.subItems.map((subItem, subIndex) => (
          <Tooltip 
            key={subIndex}
            title={subItem.label} 
            placement="right"
          >
            <Link 
              to={subItem.path} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <StyledListItemButton
                sx={{
                  justifyContent: 'center',
                  minHeight: 36,
                  mt: subIndex === 0 ? 0 : 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                    color: isActiveRoute(subItem.path) ? 'common.white' : 'text.secondary',
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
        ))}
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