import React, { createContext, useContext, useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { ThemeConfig, ThemeContextType, defaultThemeConfig, availableFonts } from '../config/theme.config';

interface ExtendedThemeContextType extends ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentMode: 'light' | 'dark';
  applyThemeMode: (mode: 'light' | 'dark') => void;
  saveTheme: () => Promise<void>;
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

// Load font
const loadFont = (fontFamilyValue: string) => {
  if (typeof document === 'undefined') return;

  const fontConfig = availableFonts.find(f => f.value === fontFamilyValue);
  if (!fontConfig || !fontConfig.url) return;

  // Check if already loaded
  const existingLink = document.querySelector(`link[href="${fontConfig.url}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.href = fontConfig.url;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
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

// Override any system preference media query styles
const addSystemPreferenceOverride = () => {
  if (typeof document !== 'undefined') {
    // Only add style tag if it doesn't exist
    if (!document.getElementById('system-preference-override')) {
      const style = document.createElement('style');
      style.id = 'system-preference-override';
      style.innerHTML = `
        
        @media (prefers-color-scheme: dark) {
          :root:not(.dark) {
            color-scheme: light;
          }
        }
        
        @media (prefers-color-scheme: light) {
          :root.dark {
            color-scheme: dark;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Set CSS variables, apply theme config to root element
const applyThemeToCssVariables = (theme: ThemeConfig, isDark: boolean) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const mode = isDark ? 'dark' : 'light';

    // Ensure theme contains all necessary properties
    const safeTheme = {
      ...defaultThemeConfig,
      ...theme
    };

    // Ensure mode properties exist
    if (!safeTheme.modes) {
      safeTheme.modes = defaultThemeConfig.modes;
    }

    // Ensure color properties exist
    if (!safeTheme.colors) {
      safeTheme.colors = defaultThemeConfig.colors;
    }

    const modeColors = safeTheme.modes[mode];

    // Apply base colors
    Object.entries(safeTheme.colors).forEach(([name, value]) => {
      root.style.setProperty(`--color-${name}`, value);
    });

    // Apply mode-specific colors
    root.style.setProperty('--color-bg-primary', modeColors.background);
    root.style.setProperty('--color-bg-surface', modeColors.surface);
    root.style.setProperty('--color-text-primary', modeColors.text.primary);
    root.style.setProperty('--color-text-secondary', modeColors.text.secondary);
    root.style.setProperty('--color-text-muted', modeColors.text.muted);
    root.style.setProperty('--color-border', modeColors.border);

    // Set border radius variables
    const borderRadiusMap = {
      'none': '0px',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem'
    };

    root.style.setProperty('--border-radius', borderRadiusMap[safeTheme.borderRadius]);

    // Apply font
    if (safeTheme.fontFamily) {
      loadFont(safeTheme.fontFamily);
      root.style.setProperty('--font-family-sans', safeTheme.fontFamily);
    }
  }
};

// Load theme config from localStorage
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('adminThemeConfig');
      if (storedTheme) {
        try {
          const parsedTheme = JSON.parse(storedTheme);
          return {
            ...defaultThemeConfig,
            ...parsedTheme,
            colors: { ...defaultThemeConfig.colors, ...(parsedTheme.colors || {}) },
            modes: {
              ...defaultThemeConfig.modes,
              ...(parsedTheme.modes || {}),
              light: { ...defaultThemeConfig.modes.light, ...(parsedTheme.modes?.light || {}), text: { ...defaultThemeConfig.modes.light.text, ...(parsedTheme.modes?.light?.text || {}) } },
              dark: { ...defaultThemeConfig.modes.dark, ...(parsedTheme.modes?.dark || {}), text: { ...defaultThemeConfig.modes.dark.text, ...(parsedTheme.modes?.dark?.text || {}) } }
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

  // Load dark mode preference from localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('adminThemeMode');
      return storedMode === 'dark';
    }
    return false;
  });

  // TRPC Hooks for backend sync
  const utils = trpc.useContext();
  const hasAuthToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('admin_access_token'));
  const { data: settingsData } = trpc.adminSettings.list.useQuery({
    group: 'appearance',
    limit: 100
  }, {
    enabled: hasAuthToken
  });

  const bulkUpdateMutation = trpc.adminSettings.bulkUpdate.useMutation({
    onSuccess: () => {
      utils.adminSettings.list.invalidate();
    }
  });

  // Sync from Backend when data loads
  useEffect(() => {
    const response = settingsData as any;
    // Check for nested data structure (paginated response)
    if (response && response.data && response.data.data) {
      const backendSettings = response.data.data as { key: string, value: any }[];
      const newTheme = { ...theme };
      let mode = isDarkMode;

      backendSettings.forEach(setting => {
        if (setting.key === 'theme.font_family') {
          newTheme.fontFamily = setting.value as string;
        }
        if (setting.key === 'theme.border_radius') {
          newTheme.borderRadius = setting.value as any;
        }
        if (setting.key === 'theme.mode') {
          if (setting.value === 'dark' && !isDarkMode) mode = true;
          if (setting.value === 'light' && isDarkMode) mode = false;
        }

        // Colors mapping
        if (setting.key === 'theme.primary_color') newTheme.colors.primary = setting.value as string;
        if (setting.key === 'theme.secondary_color') newTheme.colors.secondary = setting.value as string;
        if (setting.key === 'theme.primary_hover') newTheme.colors.primaryHover = setting.value as string;
        if (setting.key === 'theme.primary_light') newTheme.colors.primaryLight = setting.value as string;
        if (setting.key === 'theme.primary_dark') newTheme.colors.primaryDark = setting.value as string;
        if (setting.key === 'theme.secondary_hover') newTheme.colors.secondaryHover = setting.value as string;
        if (setting.key === 'theme.secondary_light') newTheme.colors.secondaryLight = setting.value as string;
        if (setting.key === 'theme.secondary_dark') newTheme.colors.secondaryDark = setting.value as string;
      });

      // Compare if anything changed to avoid loop
      if (JSON.stringify(newTheme) !== JSON.stringify(theme)) {
        setThemeState(newTheme);
      }
      if (mode !== isDarkMode) {
        setIsDarkMode(mode);
      }
    }
  }, [settingsData]);

  // Update localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminThemeConfig', JSON.stringify(theme));
      applyThemeToCssVariables(theme, isDarkMode);
    }
  }, [theme, isDarkMode]);

  // Initial theme setup on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      addSystemPreferenceOverride();

      // Still use local storage for immediate render
      const shouldBeDark = isDarkMode; // already init from state

      // Apply immediate class
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      applyThemeToCssVariables(theme, shouldBeDark);
    }
  }, []); // Run once

  // Update localStorage and document class when dark mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentMode = isDarkMode ? 'dark' : 'light';
      localStorage.setItem('adminThemeMode', currentMode);

      addThemeTransitionCSS();

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      const timer = setTimeout(() => {
        removeThemeTransitionCSS();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isDarkMode]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState((prevTheme) => {
      const updated = {
        ...prevTheme,
        ...newTheme,
      };
      return updated;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const applyThemeMode = (mode: 'light' | 'dark') => {
    setIsDarkMode(mode === 'dark');
  };

  const saveTheme = async () => {
    const updates: { key: string; value: string; group?: string; isPublic?: boolean }[] = [];

    if (theme.fontFamily) {
      updates.push({ key: 'theme.font_family', value: theme.fontFamily, group: 'appearance', isPublic: true });
    }
    if (theme.colors?.primary) updates.push({ key: 'theme.primary_color', value: theme.colors.primary, group: 'appearance', isPublic: true });
    if (theme.colors?.secondary) updates.push({ key: 'theme.secondary_color', value: theme.colors.secondary, group: 'appearance', isPublic: true });
    if (theme.colors?.primaryHover) updates.push({ key: 'theme.primary_hover', value: theme.colors.primaryHover, group: 'appearance', isPublic: true });
    if (theme.colors?.primaryLight) updates.push({ key: 'theme.primary_light', value: theme.colors.primaryLight, group: 'appearance', isPublic: true });
    if (theme.colors?.primaryDark) updates.push({ key: 'theme.primary_dark', value: theme.colors.primaryDark, group: 'appearance', isPublic: true });
    if (theme.colors?.secondaryHover) updates.push({ key: 'theme.secondary_hover', value: theme.colors.secondaryHover, group: 'appearance', isPublic: true });
    if (theme.colors?.secondaryLight) updates.push({ key: 'theme.secondary_light', value: theme.colors.secondaryLight, group: 'appearance', isPublic: true });
    if (theme.colors?.secondaryDark) updates.push({ key: 'theme.secondary_dark', value: theme.colors.secondaryDark, group: 'appearance', isPublic: true });
    if (theme.borderRadius) {
      updates.push({ key: 'theme.border_radius', value: theme.borderRadius, group: 'appearance', isPublic: true });
    }

    // Add current mode
    updates.push({ key: 'theme.mode', value: isDarkMode ? 'dark' : 'light', group: 'appearance', isPublic: true });

    if (updates.length > 0) {
      await bulkUpdateMutation.mutateAsync({ settings: updates });
    }
  };

  const value: ExtendedThemeContextType = {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    currentMode: isDarkMode ? 'dark' : 'light',
    applyThemeMode,
    saveTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 
