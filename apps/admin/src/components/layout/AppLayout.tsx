import React, { useState, useEffect } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Content from './Content';
import HorizontalNav from './HorizontalNav';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon, Fab, Zoom, useScrollTrigger } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PostAddIcon from '@mui/icons-material/PostAdd';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

// 快速操作按钮容器
const QuickActionsFab = styled('div')({
  position: 'fixed',
  bottom: '30px',
  right: '30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  zIndex: 1200
});

// 返回顶部按钮容器
const BackToTopButton = styled('div')({
  position: 'fixed',
  bottom: '100px',
  right: '30px',
  zIndex: 1200
});

// 速度拨号样式
const StyledSpeedDial = styled(SpeedDial)({
  '& .MuiFab-root': {
    width: '48px',
    height: '48px',
  },
  position: 'absolute',
  right: 0,
  bottom: 0
});

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const { type } = config;
  const navigate = useNavigate();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const { t } = useTranslationWithBackend();
  
  // 滚动触发器，当页面滚动超过100px时触发
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // 滚动到顶部的函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 快速操作选项
  const quickActions = [
    {
      icon: <PersonAddIcon />,
      name: t('admin.add_new_user', '添加新用户'),
      action: () => {
        navigate('/users/new');
        setQuickActionsOpen(false);
      }
    },
    {
      icon: <PostAddIcon />,
      name: t('admin.create_seo_entry', '新建SEO条目'),
      action: () => {
        navigate('/seo/new');
        setQuickActionsOpen(false);
      }
    },
    {
      icon: <LanguageOutlinedIcon />,
      name: t('admin.add_translation', '添加翻译'),
      action: () => {
        navigate('/translations/new');
        setQuickActionsOpen(false);
      }
    }
  ];

  // 快速操作悬浮按钮
  const renderQuickActions = () => (
    <QuickActionsFab>
      <StyledSpeedDial
        ariaLabel={t('navigation.quick_actions', '快速操作')}
        icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
        onClose={() => setQuickActionsOpen(false)}
        onOpen={() => setQuickActionsOpen(true)}
        open={quickActionsOpen}
        direction="up"
        FabProps={{
          size: 'medium',
          sx: {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }
        }}
      >
        {quickActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.action}
            FabProps={{
              sx: {
                bgcolor: theme => theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
                }
              }
            }}
          />
        ))}
      </StyledSpeedDial>
    </QuickActionsFab>
  );

  // 返回顶部按钮
  const renderBackToTop = () => (
    <BackToTopButton>
      <Zoom in={trigger}>
        <Fab
          color="secondary"
          size="small"
          aria-label={t('navigation.back_to_top', '返回顶部')}
          onClick={scrollToTop}
          sx={{
            opacity: 0.8,
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
    </BackToTopButton>
  );

  return (
    <div className={`min-h-screen flex flex-col w-full ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-grow w-full overflow-hidden">
        {/* 垂直布局的侧边栏 */}
        {type === 'vertical' && <Sidebar />}
        
        {/* 主内容区域 */}
        <div className={`
          flex flex-col flex-grow w-full overflow-hidden
          ${type === 'vertical' ? 'border-l' : ''}
          ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}
        `}>
          {/* 水平布局的顶部导航 */}
          {type === 'horizontal' && <HorizontalNav />}
          
          {/* 顶部栏 */}
          <Header />
          
          {/* 内容区域 */}
          <Content>{children}</Content>
          
          {/* 底部 */}
          <Footer />
        </div>
      </div>
      
      {/* 返回顶部按钮 */}
      {renderBackToTop()}
      
      {/* 渲染快速操作按钮 - 在屏幕右下角 */}
      {renderQuickActions()}
    </div>
  );
};

export default AppLayout; 