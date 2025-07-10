import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Content from './Content';
import HorizontalNav from './HorizontalNav';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface AppLayoutProps {
  children: React.ReactNode;
}

// 创建更专业的背景样式
const ProfessionalBackground = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
    : `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const MainContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  margin: theme.spacing(1.5),
  borderRadius: `${Number(theme.shape.borderRadius) * 1.5}px`,
  overflow: 'hidden',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
}));

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const { type } = config;

  return (
    <ProfessionalBackground className={isDarkMode ? 'dark' : ''}>
      <MainContainer elevation={0}>
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1, 
          overflow: 'hidden',
          bgcolor: isDarkMode ? 'grey.900' : 'background.paper'
        }}>
          {/* 垂直布局的侧边栏 */}
          {type === 'vertical' && <Sidebar />}
          
          {/* 主内容区域 */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flexGrow: 1, 
            overflow: 'hidden',
            borderLeft: type === 'vertical' ? 1 : 0,
            borderColor: isDarkMode ? 'grey.800' : 'grey.200'
          }}>
            {/* 水平布局的顶部导航 */}
            {type === 'horizontal' && <HorizontalNav />}
            
            {/* 顶部栏 */}
            <Header />
            
            {/* 内容区域 */}
            <Content>{children}</Content>
            
            {/* 底部 */}
            <Footer />
          </Box>
        </Box>
      </MainContainer>
    </ProfessionalBackground>
  );
};

export default AppLayout; 