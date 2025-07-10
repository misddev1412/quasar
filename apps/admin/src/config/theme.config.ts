export interface GradientConfig {
  from: string;
  to: string;
  via?: string;
}

export interface ThemeConfig {
  primaryGradient: GradientConfig;
  secondaryGradient: GradientConfig;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export const defaultThemeConfig: ThemeConfig = {
  primaryGradient: {
    from: 'from-primary-600',
    to: 'to-primary-900',
    via: 'via-primary-700'
  },
  secondaryGradient: {
    from: 'from-secondary-500',
    to: 'to-secondary-700',
    via: 'via-secondary-600'
  },
  primaryColor: 'primary',
  secondaryColor: 'secondary',
  fontFamily: 'sans',
};

export interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
} 