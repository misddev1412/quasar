import React from 'react';
import { LinearProgress, styled } from '@mui/material';
import { useRouteLoading } from '../../contexts/RouteLoadingContext';

const LoadingBar = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  zIndex: 9999,
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#f97316', // Bright orange color
    backgroundImage: 'linear-gradient(90deg, #f97316, #fb923c, #f97316)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    transition: 'width 0.3s ease-in-out',
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
}));

const RouteLoadingIndicator: React.FC = () => {
  const { isLoading } = useRouteLoading();

  if (!isLoading) {
    return null;
  }

  return <LoadingBar />;
};

export default RouteLoadingIndicator;