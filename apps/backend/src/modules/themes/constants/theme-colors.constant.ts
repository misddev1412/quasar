import { ThemeColorConfigDto, ThemeColorModesDto } from '../dto/theme.dto';

export const DEFAULT_LIGHT_THEME_COLORS: ThemeColorConfigDto = {
  bodyBackgroundColor: '#ffffff',
  surfaceBackgroundColor: '#f8fafc',
  textColor: '#0f172a',
  mutedTextColor: '#475569',
  primaryColor: '#2563eb',
  primaryTextColor: '#ffffff',
  secondaryColor: '#0ea5e9',
  secondaryTextColor: '#ffffff',
  accentColor: '#7c3aed',
  borderColor: '#e2e8f0',
};

export const DEFAULT_DARK_THEME_COLORS: ThemeColorConfigDto = {
  bodyBackgroundColor: '#111827',
  surfaceBackgroundColor: '#1f2937',
  textColor: '#f9fafb',
  mutedTextColor: '#9ca3af',
  primaryColor: '#2563eb',
  primaryTextColor: '#ffffff',
  secondaryColor: '#0ea5e9',
  secondaryTextColor: '#ffffff',
  accentColor: '#7c3aed',
  borderColor: '#374151',
};

export const buildDefaultColorModes = (): ThemeColorModesDto => ({
  light: { ...DEFAULT_LIGHT_THEME_COLORS },
  dark: { ...DEFAULT_DARK_THEME_COLORS },
});
