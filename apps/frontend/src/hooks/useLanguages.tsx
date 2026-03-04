import { trpc } from '../utils/trpc';
import type { Language, ApiResponse } from '../types/trpc';

export function useLanguages() {
  const { data: languagesData, isLoading, error } = trpc.clientLanguage.getActiveLanguages.useQuery();
  const { data: defaultLanguageData } = trpc.clientLanguage.getDefaultLanguage.useQuery();

  // Cast data to the expected API response structure
  const languagesResponse = languagesData as unknown as ApiResponse<Language[]>;
  const defaultLanguageResponse = defaultLanguageData as unknown as ApiResponse<Language>;

  const languages = languagesResponse?.status === 'OK' && languagesResponse?.data ? languagesResponse.data : [];

  const displayLanguages = languages.length > 0
    ? languages
        .filter((lang: Language) => lang.isActive)
        .sort((a: Language, b: Language) => a.sortOrder - b.sortOrder)
    : [
        // Fallback languages in case API returns empty data
        { id: '1', code: 'en', name: 'English', nativeName: 'English', icon: '🇺🇸', isActive: true, isDefault: true, sortOrder: 0 },
        { id: '2', code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', icon: '🇻🇳', isActive: true, isDefault: false, sortOrder: 1 },
      ];

  const defaultLanguage = defaultLanguageResponse?.status === 'OK' && defaultLanguageResponse?.data ? defaultLanguageResponse.data : null;

  const getLanguageName = (locale: string): string => {
    const language = displayLanguages.find((lang: Language) => lang.code === locale);
    return language?.nativeName || language?.name || locale;
  };

  const getLanguageFlag = (locale: string): string => {
    const language = displayLanguages.find((lang: Language) => lang.code === locale);
    return language?.icon || '🌐';
  };

  return {
    languages: displayLanguages,
    defaultLanguage,
    isLoading,
    error,
    getLanguageName,
    getLanguageFlag,
  };
}
