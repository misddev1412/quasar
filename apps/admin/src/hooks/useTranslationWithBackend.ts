import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../utils/trpc';
import { SupportedLocale } from '@shared';
import { getCurrentLocale } from '../i18n';

interface UseTranslationWithBackendResult {
  t: (key: string, options?: any) => string;
  i18n: any;
  ready: boolean;
  changeLanguage: (locale: SupportedLocale) => Promise<void>;
  getCurrentLocale: () => SupportedLocale;
  isLoading: boolean;
  error: string | null;
}

export const useTranslationWithBackend = (): UseTranslationWithBackendResult => {
  const { t, i18n, ready } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use i18n.resolvedLanguage which is reactive to language changes
  const currentLocale = i18n.resolvedLanguage as SupportedLocale || getCurrentLocale();
  
  // Get translations from backend
  const { data: backendTranslations, isLoading: isFetching, error: fetchError } = 
    trpc.translation.getTranslations.useQuery(
      { locale: currentLocale },
      {
        enabled: ready && !!currentLocale,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );

  // Merge backend translations with local translations
  useEffect(() => {
    if ((backendTranslations as { success?: boolean; data?: { translations?: unknown } })?.success && (backendTranslations as { data?: { translations?: unknown } }).data.translations) {
      const { translations } = (backendTranslations as { data: { translations: unknown } }).data;
      
      // Add backend translations to i18next resources
      i18n.addResourceBundle(
        currentLocale,
        'translation',
        translations,
        true, // deep merge
        true // overwrite
      );
    }
  }, [backendTranslations, i18n, currentLocale]);

  // Handle errors
  useEffect(() => {
    if (fetchError) {
      setError('Failed to load translations from server');
      console.warn('Translation fetch error:', fetchError);
    } else {
      setError(null);
    }
  }, [fetchError]);

  const changeLanguage = async (locale: SupportedLocale): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Change language in i18next
      await i18n.changeLanguage(locale);
      
      // This will trigger a refetch of translations for the new locale
      // via the query dependency on currentLocale
    } catch (err) {
      setError('Failed to change language');
      console.error('Language change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom t function that provides better fallback handling
  const customT = (key: string, fallback?: string, options?: any): string => {
    try {
      const translation = t(key, { ...options, defaultValue: fallback });

      // Ensure we return a string
      const result = typeof translation === 'string' ? translation : String(translation);

      // If translation is the same as key and we have a fallback, return the fallback
      if (result === key && fallback) {
        return fallback;
      }

      // If translation is the same as key, it means no translation found and no fallback
      if (result === key) {
        return key;
      }

      return result;
    } catch (err) {
      console.warn(`Translation error for key "${key}":`, err);
      return fallback || key;
    }
  };

  return {
    t: customT,
    i18n,
    ready: ready && !isFetching,
    changeLanguage,
    getCurrentLocale,
    isLoading: isLoading || isFetching,
    error,
  };
}; 