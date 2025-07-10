import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig, ThemeContextType, defaultThemeConfig } from '../config/theme.config';

interface ExtendedThemeContextType extends ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ExtendedThemeContextType | undefined>(undefined);

export const useTheme = (): ExtendedThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load theme config from localStorage
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('adminThemeConfig');
      if (storedTheme) {
        try {
          return JSON.parse(storedTheme);
        } catch (e) {
          return defaultThemeConfig;
        }
      }
    }
    return defaultThemeConfig;
  });

  // Load dark mode preference from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedDarkMode = localStorage.getItem('adminDarkMode');
      if (storedDarkMode !== null) {
        return storedDarkMode === 'true';
      } else {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  });

  // Update localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminThemeConfig', JSON.stringify(theme));
    }
  }, [theme]);

  // Update localStorage and document class when dark mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminDarkMode', isDarkMode.toString());
      
      // Update document class for Tailwind dark mode
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Check for system preference changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if the user hasn't explicitly set a preference
        if (localStorage.getItem('adminDarkMode') === null) {
          setIsDarkMode(e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState((prevTheme) => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 