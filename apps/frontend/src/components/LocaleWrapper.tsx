'use client';

import React from 'react';
import NextIntlProvider from './NextIntlProvider';
import enMessages from '../i18n/locales/en.json';
import viMessages from '../i18n/locales/vi.json';
import i18n from '../lib/i18n';

const supportedLocales = ['en', 'vi'] as const;
type SupportedLocale = (typeof supportedLocales)[number];
const defaultLocale: SupportedLocale = 'en';

const messages = {
  en: enMessages,
  vi: viMessages,
};

const isSupportedLocale = (value?: string | null): value is SupportedLocale =>
  !!value && supportedLocales.includes(value as SupportedLocale);

const normalizeLocale = (value?: string | null): SupportedLocale =>
  isSupportedLocale(value) ? (value as SupportedLocale) : defaultLocale;

const syncI18nLanguage = (nextLocale: SupportedLocale) => {
  if (i18n.language === nextLocale) {
    return;
  }
  try {
    void i18n.changeLanguage(nextLocale);
  } catch (error) {
    console.warn('Failed to synchronize i18n language', error);
  }
};

interface LocaleWrapperProps {
  children: React.ReactNode;
  initialLocale: string;
}

export default function LocaleWrapper({ children, initialLocale }: LocaleWrapperProps) {
  const initial = React.useMemo(() => normalizeLocale(initialLocale), [initialLocale]);
  const [locale, setLocale] = React.useState<SupportedLocale>(() => {
    syncI18nLanguage(initial);
    return initial;
  });

  React.useEffect(() => {
    const normalized = normalizeLocale(initialLocale);
    setLocale((current) => (current === normalized ? current : normalized));
  }, [initialLocale]);

  React.useEffect(() => {
    syncI18nLanguage(locale);
  }, [locale]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Simple locale detection without URL routing (client-side only)
    const getInitialLocale = (): SupportedLocale => {
      const urlParams = new URLSearchParams(window.location.search);
      const testLocale = urlParams.get('locale');
      if (isSupportedLocale(testLocale)) {
        return testLocale;
      }

      const savedLocale = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];
      if (isSupportedLocale(savedLocale)) {
        return savedLocale;
      }

      const browserLang = navigator.language.split('-')[0];
      if (isSupportedLocale(browserLang)) {
        return browserLang;
      }

      return locale;
    };

    const detectedLocale = getInitialLocale();
    setLocale((current) => (detectedLocale !== current ? detectedLocale : current));
  }, []);

  // Effect to handle locale changes via cookie (for language switcher)
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleLocaleChange = () => {
      const savedLocale = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];

      if (isSupportedLocale(savedLocale) && savedLocale !== locale) {
        setLocale(savedLocale);
      }
    };

    window.addEventListener('storage', handleLocaleChange);
    const interval = setInterval(handleLocaleChange, 1000);

    return () => {
      window.removeEventListener('storage', handleLocaleChange);
      clearInterval(interval);
    };
  }, [locale]);

  return (
    <NextIntlProvider locale={locale} messages={messages[locale] || messages.en}>
      {children}
    </NextIntlProvider>
  );
}
