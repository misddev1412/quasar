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
  // 新增主题颜色配置
  colors: ThemeColors;
  // 新增深色和浅色模式的颜色配置
  modes: ThemeColorModes;
  // 启用圆角边缘
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
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
  // 默认颜色配置
  colors: {
    primary: '#2563eb', // 加深主色调提高对比度
    secondary: '#0284c7', // 加深次要颜色提高对比度
    accent: '#7c3aed', // 加深强调色
    neutral: '#4b5563', // 加深中性色
    success: '#16a34a', // 加深成功色
    warning: '#d97706', // 加深警告色
    error: '#dc2626', // 加深错误色
    info: '#0284c7'  // 加深信息色
  },
  // 默认深色和浅色模式配置
  modes: {
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#0f172a', // 更深的主要文本颜色
        secondary: '#334155', // 更深的次要文本颜色
        muted: '#64748b'  // 更深的静音文本颜色
      },
      border: '#cbd5e1' // 更深的边框颜色
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