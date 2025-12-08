import React, { createContext, useContext, useState, useEffect } from 'react';
import { LayoutConfig, LayoutContextType, defaultLayoutConfig } from '../config/layout.config';

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  
  return context;
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<LayoutConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedConfig = localStorage.getItem('adminLayoutConfig');
      if (storedConfig) {
        try {
          return JSON.parse(storedConfig);
        } catch (e) {
          return defaultLayoutConfig;
        }
      }
    }
    return defaultLayoutConfig;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminLayoutConfig', JSON.stringify(config));
    }
  }, [config]);

  const setConfig = (newConfig: Partial<LayoutConfig>) => {
    setConfigState((prevConfig) => ({
      ...prevConfig,
      ...newConfig
    }));
  };

  const toggleSidebar = () => {
    setConfigState((prevConfig) => ({
      ...prevConfig,
      sidebarCollapsed: !prevConfig.sidebarCollapsed
    }));
  };

  const toggleLayoutType = () => {
    setConfigState((prevConfig) => ({
      ...prevConfig,
      type: prevConfig.type === 'vertical' ? 'horizontal' : 'vertical'
    }));
  };

  const value = {
    config,
    setConfig,
    toggleSidebar,
    toggleLayoutType
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}; 