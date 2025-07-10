import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Box, Paper, useTheme as useMuiTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ContentProps {
  children: React.ReactNode;
}

// 自定义内容容器样式
const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowY: 'auto',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
  height: 'calc(100vh - 128px)', // 减去header和footer的高度
}));

// 自定义内容卡片样式
const ContentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px 0 rgba(0,0,0,0.2)' 
    : '0 2px 8px 0 rgba(0,0,0,0.05)',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.background.paper,
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200]}`,
}));

export const Content: React.FC<ContentProps> = ({ children }) => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const { sidebarCollapsed, type } = config;
  
  return (
    <ContentContainer
      sx={{
        ml: {
          xs: 0,
          md: type === 'vertical' ? (sidebarCollapsed ? '70px' : '250px') : 0
        },
        transition: muiTheme.transitions.create(['margin'], {
          easing: muiTheme.transitions.easing.sharp,
          duration: muiTheme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <ContentCard>
        {children}
      </ContentCard>
    </ContentContainer>
  );
};

export default Content; 