import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

const LoadingContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullPage',
})<{ fullPage?: boolean }>(({ theme, fullPage }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  ...(fullPage && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.85)'
      : 'rgba(255, 255, 255, 0.85)',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  })
}));

const getProgressSize = (size: LoadingProps['size']): number => {
  switch(size) {
    case 'small': return 24;
    case 'large': return 60;
    case 'medium':
    default: return 40;
  }
};

export const Loading: React.FC<LoadingProps> = ({ 
  message = '加载中...',
  size = 'medium',
  fullPage = false
}) => {
  const progressSize = getProgressSize(size);
  
  return (
    <LoadingContainer fullPage={fullPage}>
      <CircularProgress 
        size={progressSize} 
        color="primary" 
        thickness={4}
        sx={{ mb: message ? 2 : 0 }}
      />
      {message && (
        <Typography 
          variant={size === 'large' ? 'h6' : 'body2'} 
          color="text.secondary"
        >
          {message}
        </Typography>
      )}
    </LoadingContainer>
  );
};

export default Loading; 