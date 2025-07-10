import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Box, Typography, useTheme as useMuiTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LogoProps {
  collapsed?: boolean;
}

// 自定义Logo容器
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  height: 64,
  overflow: 'hidden',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
}));

// Logo图标样式
const LogoIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.2)',
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
}));

const Logo: React.FC<LogoProps> = ({ collapsed = false }) => {
  const { isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <LogoContainer
      sx={{
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 1 : 2,
      }}
    >
      <LogoIcon>
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1.25rem',
          }}
        >
          Q
        </Typography>
      </LogoIcon>
      
      {!collapsed && (
        <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold',
              color: isDarkMode ? 'text.primary' : 'text.primary',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Quasar
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block'
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>
      )}
    </LogoContainer>
  );
};

export default Logo; 