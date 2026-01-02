export const THEME_MODES = ['LIGHT', 'DARK'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export interface ThemeColorConfigDto {
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

export interface CreateThemeDto {
  name: string;
  slug?: string;
  description?: string;
  mode?: ThemeMode;
  isActive?: boolean;
  isDefault?: boolean;
  colors: ThemeColorConfigDto;
}

export interface UpdateThemeDto {
  name?: string;
  slug?: string;
  description?: string;
  mode?: ThemeMode;
  isActive?: boolean;
  isDefault?: boolean;
  colors?: Partial<ThemeColorConfigDto>;
}

export interface ThemeFiltersDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  mode?: ThemeMode;
}
