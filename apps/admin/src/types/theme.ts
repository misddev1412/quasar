export interface ThemeColorConfig {
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

export interface ThemeColorModes {
  light: ThemeColorConfig;
  dark: ThemeColorConfig;
}

export interface ThemeRecord {
  colors: ThemeColorModes;
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ThemeFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
