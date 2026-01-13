export interface GradientConfig {
  from: string;
  to: string;
  via?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  info: string;

  // Specific shades/states
  primaryHover?: string;
  primaryLight?: string;
  primaryDark?: string;
  secondaryHover?: string;
  secondaryLight?: string;
  secondaryDark?: string;
}

export interface ThemeColorModes {
  light: {
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
  };
  dark: {
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
  };
}

export interface ThemeConfig {
  primaryGradient: GradientConfig;
  secondaryGradient: GradientConfig;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  colors: ThemeColors;
  modes: ThemeColorModes;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const availableFonts = [
  { name: 'Inter', value: 'Inter, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
  { name: 'Roboto', value: 'Roboto, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' },
  { name: 'Outfit', value: 'Outfit, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap' },
  { name: 'Lato', value: 'Lato, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap' },
  { name: 'Raleway', value: 'Raleway, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap' },
];

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
  fontFamily: 'Inter, sans-serif',
  colors: {
    primary: '#2563eb',
    secondary: '#0284c7',
    accent: '#7c3aed',
    neutral: '#4b5563',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7',

    // Defaults for new shades
    primaryHover: '#1d4ed8',
    primaryLight: '#60a5fa',
    primaryDark: '#1e40af',
    secondaryHover: '#0369a1',
    secondaryLight: '#38bdf8',
    secondaryDark: '#0c4a6e',
  },
  modes: {
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#0f172a',
        secondary: '#334155',
        muted: '#64748b'
      },
      border: '#cbd5e1'
    },
    dark: {
      background: '#111827',
      surface: '#1f2937',
      text: {
        primary: '#f9fafb',
        secondary: '#e5e7eb',
        muted: '#9ca3af'
      },
      border: '#374151'
    }
  },
  borderRadius: 'md'
};

export interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
} 