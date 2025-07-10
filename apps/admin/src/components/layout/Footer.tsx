import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { Box, Typography, Link as MuiLink, Divider, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled('footer')(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
}));

const Footer: React.FC = () => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const { sidebarCollapsed, type } = config;
  
  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter
      sx={{
        ml: {
          xs: 0,
          md: type === 'vertical' ? (sidebarCollapsed ? '70px' : '250px') : 0
        },
        transition: theme => theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Typography variant="caption" color="text.secondary">
          &copy; {currentYear} Quasar Admin. 保留所有权利。
        </Typography>
        
        <Stack direction="row" spacing={3}>
          <MuiLink 
            href="#" 
            color="text.secondary" 
            underline="hover"
            sx={{ 
              fontSize: '0.75rem',
              '&:hover': { color: 'primary.main' }
            }}
          >
            条款
          </MuiLink>
          <MuiLink 
            href="#" 
            color="text.secondary" 
            underline="hover"
            sx={{ 
              fontSize: '0.75rem',
              '&:hover': { color: 'primary.main' }
            }}
          >
            隐私
          </MuiLink>
          <MuiLink 
            href="#" 
            color="text.secondary" 
            underline="hover"
            sx={{ 
              fontSize: '0.75rem',
              '&:hover': { color: 'primary.main' }
            }}
          >
            帮助
          </MuiLink>
        </Stack>
      </Stack>
    </StyledFooter>
  );
};

export default Footer; 