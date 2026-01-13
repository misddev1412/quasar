import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(undefined);

export const useRouteLoading = () => {
  const context = useContext(RouteLoadingContext);
  if (!context) {
    throw new Error('useRouteLoading must be used within a RouteLoadingProvider');
  }
  return context;
};

interface RouteLoadingProviderProps {
  children: React.ReactNode;
}

export const RouteLoadingProvider: React.FC<RouteLoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleStart = () => {
      timeoutId = setTimeout(() => {
        setIsLoading(true);
      }, 200); // Show loading only after 200ms to avoid flickering for fast loads
    };

    const handleEnd = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };

    handleStart();

    // Simulate loading completion after route change
    const timer = setTimeout(() => {
      handleEnd();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timer);
      handleEnd();
    };
  }, [location.pathname]);

  return (
    <RouteLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </RouteLoadingContext.Provider>
  );
};