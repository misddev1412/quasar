import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';

interface ContentProps {
  children: React.ReactNode;
}

export const Content: React.FC<ContentProps> = ({ children }) => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const { sidebarCollapsed, type } = config;
  
  return (
    <div className={`
      flex-grow w-full h-[calc(100vh-128px)] overflow-y-auto
      ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
      transition-all duration-300 ease-in-out
    `}>
      {children}
    </div>
  );
};

export default Content; 