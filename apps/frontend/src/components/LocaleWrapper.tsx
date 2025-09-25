'use client';

import React from 'react';
import NextIntlProvider from './NextIntlProvider';
import enMessages from '../i18n/locales/en.json';
import viMessages from '../i18n/locales/vi.json';

const messages = {
  en: enMessages,
  vi: viMessages,
};

interface LocaleWrapperProps {
  children: React.ReactNode;
}

export default function LocaleWrapper({ children }: LocaleWrapperProps) {
  const [locale, setLocale] = React.useState('en');

  React.useEffect(() => {
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];

    if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
      setLocale(savedLocale);
    }
  }, []);

  return (
    <NextIntlProvider locale={locale} messages={messages[locale as keyof typeof messages] || messages.en}>
      {children}
    </NextIntlProvider>
  );
}