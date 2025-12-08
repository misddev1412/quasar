import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import static translation files
import enTranslations from '../i18n/locales/en.json';
import viTranslations from '../i18n/locales/vi.json';

// Use static translations as resources
const resources = {
  en: {
    translation: enTranslations
  },
  vi: {
    translation: viTranslations
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupCookie: 'NEXT_LOCALE',
    },

    resources,

    interpolation: {
      escapeValue: false, // react already does escaping
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;