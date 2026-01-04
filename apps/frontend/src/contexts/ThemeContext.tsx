'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

interface ThemeColorConfig {
  bodyBackgroundColor: string;
  surfaceBackgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  primaryColor: string;
  primaryTextColor: string;
  secondaryColor: string;
  secondaryTextColor: string;
  accentColor: string;
  borderColor: string;
}

interface ThemeColorModes {
  light: ThemeColorConfig;
  dark: ThemeColorConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [themeColors, setThemeColors] = useState<ThemeColorModes | null>(null);

  // Fetch theme settings from backend
  const { data: settingsData } = trpc.public.settings.getByGroup.useQuery(
    { group: 'storefront_appearance' },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false
    }
  );

  const { data: defaultThemeData } = trpc.publicThemes.getActiveTheme.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    const colors = (defaultThemeData?.data as { colors?: ThemeColorModes } | undefined)?.colors;
    if (!colors) return;
    const root = document.documentElement;
    const applyPalette = (mode: Theme, palette: ThemeColorConfig) => {
      const suffix = mode === 'light' ? 'light' : 'dark';
      root.style.setProperty(`--storefront-body-${suffix}`, palette.bodyBackgroundColor);
      root.style.setProperty(`--storefront-surface-${suffix}`, palette.surfaceBackgroundColor);
      root.style.setProperty(`--storefront-text-${suffix}`, palette.textColor);
      root.style.setProperty(`--storefront-muted-${suffix}`, palette.mutedTextColor);
      root.style.setProperty(`--storefront-border-${suffix}`, palette.borderColor);
      root.style.setProperty(`--storefront-accent-${suffix}`, palette.accentColor);
      root.style.setProperty(`--color-primary-${suffix}`, palette.primaryColor);
      root.style.setProperty(`--color-secondary-${suffix}`, palette.secondaryColor);
      root.style.setProperty(`--color-accent-${suffix}`, palette.accentColor);
    };

    applyPalette('light', colors.light);
    applyPalette('dark', colors.dark);
    setThemeColors(colors);
    root.setAttribute('data-storefront-theme', 'custom');
  }, [defaultThemeData]);

  useEffect(() => {
    if (settingsData?.data) {
      const settings = settingsData.data as any[];
      const root = document.documentElement;

      settings.forEach(setting => {
        if (setting.key === 'storefront.theme.font_family' && setting.value) {
          root.style.setProperty('--font-sans', setting.value);
        }
        if (setting.key === 'storefront.theme.primary_color' && setting.value) {
          root.style.setProperty('--primary-color', setting.value);
          root.style.setProperty('--color-primary', setting.value); // Alias for consistency
        }
        if (setting.key === 'storefront.theme.secondary_color' && setting.value) {
          root.style.setProperty('--color-secondary', setting.value);
        }

        // Extended Palette
        if (setting.key === 'storefront.theme.primary_hover' && setting.value) root.style.setProperty('--color-primary-hover', setting.value);
        if (setting.key === 'storefront.theme.primary_light' && setting.value) root.style.setProperty('--color-primary-light', setting.value);
        if (setting.key === 'storefront.theme.primary_dark' && setting.value) root.style.setProperty('--color-primary-dark', setting.value);

        if (setting.key === 'storefront.theme.secondary_hover' && setting.value) root.style.setProperty('--color-secondary-hover', setting.value);
        if (setting.key === 'storefront.theme.secondary_light' && setting.value) root.style.setProperty('--color-secondary-light', setting.value);
        if (setting.key === 'storefront.theme.secondary_dark' && setting.value) root.style.setProperty('--color-secondary-dark', setting.value);
        if (setting.key === 'storefront.theme.border_radius' && setting.value) {
          const radiusMap: Record<string, string> = {
            'none': '0px',
            'sm': '0.125rem',
            'md': '0.375rem',
            'lg': '0.5rem',
            'xl': '0.75rem',
            'full': '9999px'
          };
          root.style.setProperty('--radius', radiusMap[setting.value] || '0.5rem');
        }
      });
    }
  }, [settingsData]);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme || 'light';

    setThemeState(initialTheme);
    applyTheme(initialTheme);

    return () => undefined;
  }, []);

  useEffect(() => {
    if (!themeColors || !mounted) return;
    applyTheme(theme);
  }, [themeColors, mounted, theme]);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    if (themeColors) {
      const palette = theme === 'dark' ? themeColors.dark : themeColors.light;
      root.style.setProperty('--color-primary', palette.primaryColor);
      root.style.setProperty('--color-secondary', palette.secondaryColor);
      root.style.setProperty('--color-accent', palette.accentColor);
      root.style.setProperty('--storefront-body', palette.bodyBackgroundColor);
      root.style.setProperty('--storefront-surface', palette.surfaceBackgroundColor);
      root.style.setProperty('--storefront-text', palette.textColor);
      root.style.setProperty('--storefront-muted', palette.mutedTextColor);
      root.style.setProperty('--storefront-border', palette.borderColor);
      root.style.setProperty('--storefront-accent', palette.accentColor);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Always provide the context, even during initial render
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
