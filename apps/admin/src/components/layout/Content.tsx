import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';

interface ContentProps {
  children: React.ReactNode;
}

export const Content: React.FC<ContentProps> = ({ children }) => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const { sidebarCollapsed, type } = config;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [location.pathname, location.search]);
  
  return (
    <div
      ref={containerRef}
      className={`
      flex-grow w-full h-[calc(100vh-128px)] overflow-y-auto
      ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
      transition-all duration-300 ease-in-out
    `}
    >
      {children}
    </div>
  );
};

export default Content; 
