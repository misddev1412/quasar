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

export interface ThemeColorModesDto {
  light: ThemeColorConfigDto;
  dark: ThemeColorConfigDto;
}

export interface ThemeColorModesPartialDto {
  light?: Partial<ThemeColorConfigDto>;
  dark?: Partial<ThemeColorConfigDto>;
}

export interface CreateThemeDto {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  colors: ThemeColorModesDto;
}

export interface UpdateThemeDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  colors?: ThemeColorModesPartialDto;
}

export interface ThemeFiltersDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
