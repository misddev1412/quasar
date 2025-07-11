import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

// Styled components for the logo
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.3s ease',
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 29,
  height: 29,
  borderRadius: 8,
  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  boxShadow: '0px 4px 10px rgba(37, 99, 235, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 6px 15px rgba(37, 99, 235, 0.4)',
  }
}));

interface LogoProps {
  collapsed?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  collapsed = false,
  onClick
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslationWithBackend();

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
            fontSize: '1rem',
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
            {t('common.brand_name', 'Quasar')}
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
            {t('common.admin_dashboard', 'Admin Dashboard')}
          </Typography>
        </Box>
      )}
    </LogoContainer>
  );
};

export default Logo; 