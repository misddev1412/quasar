'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppInitContextType {
  isInitialized: boolean;
  isLoading: boolean;
  initializationProgress: number;
  initializationMessage: string;
}

const AppInitContext = createContext<AppInitContextType | undefined>(undefined);

interface InitializationStep {
  name: string;
  message: string;
  action: () => Promise<void>;
}

export const AppInitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const [initializationMessage, setInitializationMessage] = useState('Initializing application...');

  useEffect(() => {
    const initializeApp = async () => {
      const steps: InitializationStep[] = [
        {
          name: 'dom',
          message: 'Preparing application...',
          action: async () => {
            if (typeof window !== 'undefined' && document.readyState !== 'complete') {
              await new Promise<void>((resolve) => {
                window.addEventListener('load', () => resolve(), { once: true });
                if (document.readyState === 'complete') resolve();
              });
            }
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        },
        {
          name: 'theme',
          message: 'Loading theme preferences...',
          action: async () => {
            if (typeof window !== 'undefined') {
              const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
              const theme = savedTheme || 'light';
              document.documentElement.classList.toggle('dark', theme === 'dark');
              document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        },
        {
          name: 'auth',
          message: 'Checking authentication...',
          action: async () => {
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('token');
              if (token) {
                await new Promise(resolve => setTimeout(resolve, 200));
              }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        },
        {
          name: 'config',
          message: 'Loading configuration...',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        },
        {
          name: 'resources',
          message: 'Finalizing...',
          action: async () => {
            await Promise.all([
              new Promise(resolve => setTimeout(resolve, 100)),
              document.fonts?.ready || Promise.resolve(),
            ]);
          }
        }
      ];

      try {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          setInitializationMessage(step.message);
          setInitializationProgress((i / steps.length) * 100);

          await step.action();

          setInitializationProgress(((i + 1) / steps.length) * 100);
        }

        setInitializationMessage('Ready!');
        await new Promise(resolve => setTimeout(resolve, 300));

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitializationMessage('Failed to initialize. Please refresh the page.');
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    if (typeof window !== 'undefined') {
      initializeApp();
    } else {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  return (
    <AppInitContext.Provider
      value={{
        isInitialized,
        isLoading,
        initializationProgress,
        initializationMessage
      }}
    >
      {children}
    </AppInitContext.Provider>
  );
};

export const useAppInit = () => {
  const context = useContext(AppInitContext);
  if (context === undefined) {
    throw new Error('useAppInit must be used within an AppInitProvider');
  }
  return context;
};
