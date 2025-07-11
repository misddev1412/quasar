import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig, ThemeContextType, defaultThemeConfig } from '../config/theme.config';

interface ExtendedThemeContextType extends ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentMode: 'light' | 'dark';
  applyThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ExtendedThemeContextType | undefined>(undefined);

export const useTheme = (): ExtendedThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Add CSS for theme transition
const addThemeTransitionCSS = () => {
  if (typeof document !== 'undefined') {
    // Only add the style tag if it doesn't exist already
    if (!document.getElementById('theme-transition-style')) {
      const style = document.createElement('style');
      style.id = 'theme-transition-style';
      style.innerHTML = `
        *, *::before, *::after {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease, box-shadow 0.3s ease !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Remove transition after mode switch to avoid transition when page loads
const removeThemeTransitionCSS = () => {
  if (typeof document !== 'undefined') {
    const style = document.getElementById('theme-transition-style');
    if (style) {
      style.remove();
    }
  }
};

// 设置CSS变量，应用主题配置到根元素
const applyThemeToCssVariables = (theme: ThemeConfig, isDark: boolean) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const mode = isDark ? 'dark' : 'light';
    
    // 确保theme包含所有必要的属性
    const safeTheme = {
      ...defaultThemeConfig,
      ...theme
    };
    
    // 确保模式属性存在
    if (!safeTheme.modes) {
      safeTheme.modes = defaultThemeConfig.modes;
    }
    
    // 确保颜色属性存在
    if (!safeTheme.colors) {
      safeTheme.colors = defaultThemeConfig.colors;
    }
    
    const modeColors = safeTheme.modes[mode];
    
    // 应用基础颜色
    Object.entries(safeTheme.colors).forEach(([name, value]) => {
      root.style.setProperty(`--color-${name}`, value);
    });
    
    // 应用模式特定颜色
    root.style.setProperty('--color-bg-primary', modeColors.background);
    root.style.setProperty('--color-bg-surface', modeColors.surface);
    root.style.setProperty('--color-text-primary', modeColors.text.primary);
    root.style.setProperty('--color-text-secondary', modeColors.text.secondary);
    root.style.setProperty('--color-text-muted', modeColors.text.muted);
    root.style.setProperty('--color-border', modeColors.border);
    
    // 设置圆角变量
    const borderRadiusMap = {
      'none': '0px',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem'
    };
    
    root.style.setProperty('--border-radius', borderRadiusMap[safeTheme.borderRadius]);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 用户主题偏好配置 - 默认为light而不是system
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  
  // Load theme config from localStorage
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('adminThemeConfig');
      if (storedTheme) {
        try {
          // 合并已存储的配置和默认配置，确保新属性存在
          const parsedTheme = JSON.parse(storedTheme);
          return {
            ...defaultThemeConfig,
            ...parsedTheme,
            // 确保新增的嵌套属性也正确合并
            colors: {
              ...defaultThemeConfig.colors,
              ...(parsedTheme.colors || {})
            },
            modes: {
              ...defaultThemeConfig.modes,
              ...(parsedTheme.modes || {}),
              // 确保light和dark模式也被正确合并
              light: {
                ...defaultThemeConfig.modes.light,
                ...(parsedTheme.modes?.light || {}),
                // 确保text属性也被正确合并
                text: {
                  ...defaultThemeConfig.modes.light.text,
                  ...(parsedTheme.modes?.light?.text || {})
                }
              },
              dark: {
                ...defaultThemeConfig.modes.dark,
                ...(parsedTheme.modes?.dark || {}),
                // 确保text属性也被正确合并
                text: {
                  ...defaultThemeConfig.modes.dark.text,
                  ...(parsedTheme.modes?.dark?.text || {})
                }
              }
            }
          };
        } catch (e) {
          console.error('Error parsing stored theme:', e);
          return defaultThemeConfig;
        }
      }
    }
    return defaultThemeConfig;
  });

  // 获取系统当前主题偏好
  const getSystemThemePreference = (): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };
  
  // 根据themeMode和系统偏好计算实际isDarkMode值
  const calculateIsDarkMode = (mode: 'light' | 'dark' | 'system'): boolean => {
    if (mode === 'system') {
      return getSystemThemePreference();
    }
    return mode === 'dark';
  };

  // Load dark mode preference from localStorage, default to light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('adminThemeMode');
      if (storedMode) {
        setThemeMode(storedMode as 'light' | 'dark' | 'system');
        return calculateIsDarkMode(storedMode as 'light' | 'dark' | 'system');
      } else {
        // 设置默认为浅色模式
        localStorage.setItem('adminThemeMode', 'light');
        return false;
      }
    }
    return false;
  });

  // Update localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminThemeConfig', JSON.stringify(theme));
      
      // 应用主题到CSS变量
      applyThemeToCssVariables(theme, isDarkMode);
    }
  }, [theme, isDarkMode]);

  // Initial theme setup on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('adminThemeMode');
      
      if (storedMode) {
        setThemeMode(storedMode as 'light' | 'dark' | 'system');
        const shouldBeDark = calculateIsDarkMode(storedMode as 'light' | 'dark' | 'system');
        setIsDarkMode(shouldBeDark);
      } else {
        // 设置默认为浅色模式
        setThemeMode('light');
        setIsDarkMode(false);
        localStorage.setItem('adminThemeMode', 'light');
      }
      
      // 应用初始主题变量
      applyThemeToCssVariables(theme, isDarkMode);
    }
  }, []);

  // Update localStorage and document class when dark mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminThemeMode', themeMode);
      
      // Add transition effect before changing theme
      addThemeTransitionCSS();
      
      // Update document class for Tailwind dark mode
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      
      console.log(`Theme mode: ${themeMode}, Dark mode is: ${isDarkMode ? "enabled" : "disabled"}`);
      
      // Remove transition effect after theme change completes
      const timer = setTimeout(() => {
        removeThemeTransitionCSS();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isDarkMode, themeMode]);

  // 强制初始渲染为浅色模式
  useEffect(() => {
    setIsDarkMode(false);
    setThemeMode('light');
    localStorage.setItem('adminThemeMode', 'light');
    
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState((prevTheme) => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  const toggleDarkMode = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
    setIsDarkMode(!isDarkMode);
  };
  
  // 新增：手动设置主题模式（浅色/深色/系统）
  const applyThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setIsDarkMode(calculateIsDarkMode(mode));
  };

  const value: ExtendedThemeContextType = {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    currentMode: isDarkMode ? 'dark' : 'light',
    applyThemeMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 