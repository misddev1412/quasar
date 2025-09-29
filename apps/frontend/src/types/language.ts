export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  icon?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export interface LocaleConfig {
  defaultLocale: 'vi' | 'en';
  supportedLocales: readonly ('vi' | 'en')[];
}

export interface TranslationData {
  locale: 'vi' | 'en';
  translations: Record<string, string>;
}