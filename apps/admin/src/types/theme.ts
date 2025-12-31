export type ThemeMode = 'light' | 'dark';

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

export interface ThemeRecord extends ThemeColorConfig {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  mode: ThemeMode;
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
  mode?: ThemeMode;
}
