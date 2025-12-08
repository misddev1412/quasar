export interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
  namespace?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TranslationCreateDto {
  key: string;
  locale: string;
  value: string;
  namespace?: string;
}

export interface TranslationUpdateDto {
  value?: string;
  is_active?: boolean;
}

export type SupportedLocale = 'vi' | 'en';

export interface LocaleConfig {
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
}

export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

export interface LocaleTranslations {
  [locale: string]: TranslationMap;
} 