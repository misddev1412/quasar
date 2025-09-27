'use client';

import React from 'react';
import NextIntlProvider from './NextIntlProvider';
import enMessages from '../i18n/locales/en.json';
import viMessages from '../i18n/locales/vi.json';

const supportedLocales = ['en', 'vi'];
const defaultLocale = 'en';

const messages = {
  en: enMessages,
  vi: viMessages,
};

interface LocaleWrapperProps {
  children: React.ReactNode;
}

export default function LocaleWrapper({ children }: LocaleWrapperProps) {
  const [locale, setLocale] = React.useState(defaultLocale);

  React.useEffect(() => {
    // Simple locale detection without URL routing (client-side only)
    const getInitialLocale = () => {
      // Check for test parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const testLocale = urlParams.get('locale');
      if (testLocale && supportedLocales.includes(testLocale as any)) {
        return testLocale;
      }

      // Check cookie first
      const savedLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];

      if (savedLocale && supportedLocales.includes(savedLocale as any)) {
        return savedLocale;
      }

      // Try browser language
      const browserLang = navigator.language.split('-')[0];
      if (supportedLocales.includes(browserLang as any)) {
        return browserLang;
      }

      return defaultLocale;
    };

    const detectedLocale = getInitialLocale();
    setLocale(detectedLocale);
  }, []);

  // Effect to handle locale changes via cookie (for language switcher)
  React.useEffect(() => {
    const handleLocaleChange = () => {
      const savedLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];

      if (savedLocale && supportedLocales.includes(savedLocale as any) && savedLocale !== locale) {
        setLocale(savedLocale);
      }
    };

    // Listen for storage changes (in case language is changed in another tab)
    window.addEventListener('storage', handleLocaleChange);

    // Check cookie periodically (for language switcher)
    const interval = setInterval(handleLocaleChange, 1000);

    return () => {
      window.removeEventListener('storage', handleLocaleChange);
      clearInterval(interval);
    };
  }, [locale]);

  
  return (
    <NextIntlProvider locale={locale} messages={messages[locale as keyof typeof messages] || messages.en}>
      {children}
    </NextIntlProvider>
  );
}