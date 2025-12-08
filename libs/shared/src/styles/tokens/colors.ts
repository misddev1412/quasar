/**
 * Color Design Tokens
 * A comprehensive color system for the Quasar application
 */

// Base color palette
export const colors = {
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Primary brand color
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary color
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Success color
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning color
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error color
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Info color
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
} as const;

// Semantic color tokens
export const semanticColors = {
  // Text colors
  text: {
    primary: {
      light: colors.neutral[900],
      dark: colors.neutral[50]
    },
    secondary: {
      light: colors.neutral[600],
      dark: colors.neutral[300]
    },
    tertiary: {
      light: colors.neutral[500],
      dark: colors.neutral[400]
    },
    inverse: {
      light: colors.neutral[50],
      dark: colors.neutral[900]
    },
    disabled: {
      light: colors.neutral[400],
      dark: colors.neutral[600]
    },
  },

  // Background colors
  background: {
    primary: {
      light: '#ffffff',
      dark: colors.neutral[900]
    },
    secondary: {
      light: colors.neutral[50],
      dark: colors.neutral[800]
    },
    tertiary: {
      light: colors.neutral[100],
      dark: colors.neutral[700]
    },
    inverse: {
      light: colors.neutral[900],
      dark: '#ffffff'
    },
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border colors
  border: {
    default: {
      light: colors.neutral[200],
      dark: colors.neutral[700]
    },
    focus: {
      light: colors.primary[500],
      dark: colors.primary[400]
    },
    error: {
      light: colors.error[500],
      dark: colors.error[400]
    },
    success: {
      light: colors.success[500],
      dark: colors.success[400]
    },
    warning: {
      light: colors.warning[500],
      dark: colors.warning[400]
    },
  },

  // State colors
  state: {
    hover: {
      primary: {
        light: colors.primary[600],
        dark: colors.primary[400]
      },
      secondary: {
        light: colors.neutral[100],
        dark: colors.neutral[700]
      },
    },
    active: {
      primary: {
        light: colors.primary[700],
        dark: colors.primary[300]
      },
      secondary: {
        light: colors.neutral[200],
        dark: colors.neutral[600]
      },
    },
    focus: {
      ring: {
        light: colors.primary[500],
        dark: colors.primary[400]
      },
    },
    disabled: {
      background: {
        light: colors.neutral[100],
        dark: colors.neutral[800]
      },
      text: {
        light: colors.neutral[400],
        dark: colors.neutral[600]
      },
    },
  },
} as const;

// Export all color tokens
export const colorTokens = {
  ...colors,
  semantic: semanticColors,
} as const;

export type ColorTokens = typeof colorTokens; 