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

// 优化搜索框样式
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
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

// 优化头像样式
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 0 0 2px ' + alpha(theme.palette.primary.main, 0.3),
  }
}));

// 优化图标按钮
const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  backgroundColor: 'transparent',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  }
}));

// 新增暗黑模式切换按钮样式
const ThemeToggleButton = styled(Box)(({ theme }) => ({
  width: '34px',
  height: '34px',
  borderRadius: '17px',
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.grey[300], 0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
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
        {/* 左侧区域 */}
        <Tooltip title={`切换到${config.type === 'vertical' ? '水平' : '垂直'}导航`}>
          <ActionButton
            edge="start"
            color="inherit"
            aria-label="toggle layout"
            onClick={toggleLayoutType}
            size="small"
          >
            {config.type === 'vertical' ? <ViewSidebarIcon fontSize="small" /> : <ViewComfyIcon fontSize="small" />}
          </ActionButton>
        </Tooltip>

        {/* 搜索框 */}
        <Search sx={{ display: { xs: 'none', md: 'flex' } }}>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="搜索..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        {/* 右侧区域 */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* 文档按钮 */}
          <Tooltip title="文档">
            <ActionButton size="small">
              <MenuBookIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          {/* 帮助按钮 */}
          <Tooltip title="帮助">
            <ActionButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          {/* 暗黑模式切换 - 新样式 */}
          <Tooltip title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}>
            <ThemeToggleButton onClick={toggleDarkMode}>
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
          
          {/* 语言切换器 */}
          <LocaleSwitcher />
          
          {/* 通知 */}
          <Tooltip title="通知">
            <ActionButton size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </ActionButton>
          </Tooltip>
          
          {/* 用户头像 */}
          <Tooltip title="用户配置">
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