import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import { Language } from '../types/language';

export interface UseLanguagesResult {
  languages: Language[];
  activeLanguages: Language[];
  defaultLanguage: Language | null;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

/**
 * Hook to fetch and manage languages from the database
 */
export const useLanguages = (): UseLanguagesResult => {
  // Fetch active languages for dropdowns and selectors
  const {
    data: activeLanguagesData,
    isLoading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = trpc.adminLanguage.getActiveLanguages.useQuery();

  // Fetch all languages for comprehensive management
  const {
    data: allLanguagesData,
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = trpc.adminLanguage.getLanguages.useQuery({
    limit: 100, // Get all languages
    page: 1,
  });

  // Parse the active languages response
  const activeLanguages = useMemo(() => {
    if (!activeLanguagesData || !(activeLanguagesData as any)?.data) return [];
    const data = (activeLanguagesData as any).data;
    return Array.isArray(data) ? data as Language[] : [];
  }, [activeLanguagesData]);

  // Parse the all languages response  
  const allLanguages = useMemo(() => {
    if (!allLanguagesData || !(allLanguagesData as any)?.data?.items) return [];
    const items = (allLanguagesData as any).data.items;
    return Array.isArray(items) ? items as Language[] : [];
  }, [allLanguagesData]);

  // Find the default language
  const defaultLanguage = useMemo(() => {
    const fromActive = activeLanguages.find((lang: Language) => lang.isDefault);
    const fromAll = allLanguages.find((lang: Language) => lang.isDefault);
    return fromActive || fromAll || null;
  }, [activeLanguages, allLanguages]);

  // Combined refetch function
  const refetch = () => {
    refetchActive();
    refetchAll();
  };

  return {
    languages: allLanguages,
    activeLanguages,
    defaultLanguage,
    isLoading: activeLoading || allLoading,
    error: activeError || allError,
    refetch,
  };
};

/**
 * Hook to get only active languages (lighter weight)
 */
export const useActiveLanguages = () => {
  const {
    data: activeLanguagesData,
    isLoading,
    error,
    refetch,
  } = trpc.adminLanguage.getActiveLanguages.useQuery();

  const activeLanguages = useMemo(() => {
    if (!activeLanguagesData || !(activeLanguagesData as any)?.data) return [];
    const data = (activeLanguagesData as any).data;
    return Array.isArray(data) ? data as Language[] : [];
  }, [activeLanguagesData]);

  const defaultLanguage = useMemo(() => {
    return activeLanguages.find((lang: Language) => lang.isDefault) || null;
  }, [activeLanguages]);

  return {
    activeLanguages,
    defaultLanguage,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get language options formatted for select components
 */
export const useLanguageOptions = () => {
  const { activeLanguages, isLoading, error, refetch } = useActiveLanguages();

  const languageOptions = useMemo(() => {
    return activeLanguages.map((language: Language) => ({
      value: language.code,
      label: `${language.icon || '🌐'} ${language.name}`,
      nativeName: language.nativeName,
      isDefault: language.isDefault,
      sortOrder: language.sortOrder,
    }));
  }, [activeLanguages]);

  return {
    languageOptions,
    isLoading,
    error,
    refetch,
  };
};