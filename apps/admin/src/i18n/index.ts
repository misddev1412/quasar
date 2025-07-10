import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SupportedLocale } from '@shared';

// Import translation files
import vi from './locales/vi.json';
import en from './locales/en.json';

const resources = {
  vi: {
    translation: vi
  },
  en: {
    translation: en
  }
};

const supportedLngs: SupportedLocale[] = ['vi', 'en'];
const fallbackLng: SupportedLocale = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    supportedLngs,
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'admin-locale',
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper functions for locale management
export const getCurrentLocale = (): SupportedLocale => {
  return i18n.language as SupportedLocale;
};

export const changeLocale = (locale: SupportedLocale): void => {
  i18n.changeLanguage(locale);
};

export const getSupportedLocales = (): SupportedLocale[] => {
  return supportedLngs;
}; 