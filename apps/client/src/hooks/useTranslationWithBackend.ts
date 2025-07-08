import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { trpc } from '../utils/trpc';
import { SupportedLocale } from '@quasar/shared';

interface UseTranslationWithBackendResult {
  t: (key: string, options?: any) => string;
  ready: boolean;
  changeLanguage: (locale: SupportedLocale) => Promise<void>;
  currentLocale: SupportedLocale;
  isLoading: boolean;
  error: string | null;
}

export const useTranslationWithBackend = (): UseTranslationWithBackendResult => {
  const { t, i18n, ready } = useTranslation('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentLocale = (router.locale || 'vi') as SupportedLocale;
  
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
    if (backendTranslations?.success && backendTranslations.data.translations) {
      const { translations } = backendTranslations.data;
      
      // Add backend translations to i18next resources
      i18n.addResourceBundle(
        currentLocale,
        'common',
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

  const changeLanguage = useCallback(async (locale: SupportedLocale): Promise<void> => {
    if (locale === currentLocale) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Next.js router to change locale
      await router.push(router.asPath, router.asPath, { locale });
    } catch (err) {
      setError('Failed to change language');
      console.error('Language change error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router, currentLocale]);

  // Custom t function that provides better fallback handling
  const customT = useCallback((key: string, options?: any): string => {
    try {
      const translation = t(key, { ...options, defaultValue: undefined });
      
      // If translation is the same as key, it means no translation found
      if (translation === key) {
        // Return the key as fallback
        return key;
      }
      
      return translation;
    } catch (err) {
      console.warn(`Translation error for key "${key}":`, err);
      return key;
    }
  }, [t]);

  return {
    t: customT,
    ready: ready && !isFetching,
    changeLanguage,
    currentLocale,
    isLoading: isLoading || isFetching,
    error,
  };
}; 