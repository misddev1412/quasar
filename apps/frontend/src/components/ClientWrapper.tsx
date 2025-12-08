'use client';

import React from 'react';
import { useAppInit } from '../contexts/AppInitContext';
import AppLoadingOverlay from './common/AppLoadingOverlay';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  const { isLoading, initializationProgress, initializationMessage } = useAppInit();

  return (
    <>
      <AppLoadingOverlay
        isLoading={isLoading}
        progress={initializationProgress}
        message={initializationMessage}
      />
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  );
};

export default ClientWrapper;