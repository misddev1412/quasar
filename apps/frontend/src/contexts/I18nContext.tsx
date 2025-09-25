'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../utils/trpc';
import type { LocaleConfig, TranslationData } from '../types/trpc';
import '../lib/i18n';

export type Locale = 'vi' | 'en';

interface I18nContextType {
  currentLocale: Locale;
  supportedLocales: readonly Locale[];
  defaultLocale: Locale;
  changeLocale: (locale: Locale) => void;
  isLoading: boolean;
  error: string | null;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();

  // Initialize with saved locale or browser preference
  const getInitialLocale = (): Locale => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && ['en', 'vi'].includes(savedLocale)) {
        return savedLocale;
      }
      const browserLocale = navigator.language.split('-')[0] as Locale;
      return ['en', 'vi'].includes(browserLocale) ? browserLocale : 'en';
    }
    return 'en'; // default for SSR
  };

  const [currentLocale, setCurrentLocale] = useState<Locale>(getInitialLocale());
  const [supportedLocales, setSupportedLocales] = useState<readonly Locale[]>(['en', 'vi']);
  const [defaultLocale, setDefaultLocale] = useState<Locale>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get locale configuration from API
  const { data: localeConfigData, error: localeConfigError } = trpc.translation.getLocaleConfig.useQuery(
    undefined,
    {
      retry: 1,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  // Get translations for current locale
  const { data: translationsData, error: translationsError } = trpc.translation.getTranslations.useQuery(
    { locale: currentLocale },
    {
      enabled: !!currentLocale,
      retry: 1,
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  // Initialize locale configuration
  useEffect(() => {
    if (localeConfigData?.success && localeConfigData.data) {
      const config = localeConfigData.data;
      setSupportedLocales(config.supportedLocales);
      setDefaultLocale(config.defaultLocale);

      // Set initial locale from browser detection or saved preference
      const savedLocale = localStorage.getItem('locale') as Locale;
      const browserLocale = navigator.language.split('-')[0] as Locale;

      const initialLocale =
        savedLocale && config.supportedLocales.includes(savedLocale)
          ? savedLocale
          : config.supportedLocales.includes(browserLocale)
          ? browserLocale
          : config.defaultLocale;

      setCurrentLocale(initialLocale);
      i18n.changeLanguage(initialLocale);
    }

    if (localeConfigError) {
      setError('Failed to load locale configuration');
      // Fallback to default configuration
      const fallbackLocale: Locale = 'en';
      setCurrentLocale(fallbackLocale);
      i18n.changeLanguage(fallbackLocale);
    }

    setIsLoading(false);
  }, [localeConfigData, localeConfigError, i18n]);

  // Load translations when they are available
  useEffect(() => {
    if (translationsData?.success && translationsData.data) {
      const { locale, translations } = translationsData.data;

      // Add translations to i18next resources
      i18n.addResourceBundle(locale, 'translation', translations, true, true);

      // Clear any previous translation errors
      if (error && error.includes('translation')) {
        setError(null);
      }
    }

    if (translationsError) {
      console.warn(`Failed to load translations for ${currentLocale}:`, translationsError);
      // Don't set error for translations as we have fallbacks
    }
  }, [translationsData, translationsError, currentLocale, i18n, error]);

  const changeLocale = (locale: Locale) => {
    if (!supportedLocales.includes(locale)) {
      console.warn(`Unsupported locale: ${locale}`);
      return;
    }

    setCurrentLocale(locale);
    i18n.changeLanguage(locale);
    localStorage.setItem('locale', locale);
  };

  const contextValue: I18nContextType = {
    currentLocale,
    supportedLocales,
    defaultLocale,
    changeLocale,
    isLoading,
    error,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nProvider;