import React from 'react';
import { SupportedLocale } from '@quasar/shared';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { getSupportedLocales } from '../i18n';

interface LocaleSwitcherProps {
  className?: string;
}

const localeNames: Record<SupportedLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English'
};

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ className = '' }) => {
  const { getCurrentLocale, changeLanguage, isLoading } = useTranslationWithBackend();
  const currentLocale = getCurrentLocale();
  const supportedLocales = getSupportedLocales();

  const handleLocaleChange = async (locale: SupportedLocale) => {
    if (locale !== currentLocale && !isLoading) {
      try {
        await changeLanguage(locale);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    }
  };

  return (
    <div className={`locale-switcher ${className}`}>
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
        disabled={isLoading}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        {supportedLocales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
      {isLoading && (
        <span className="ml-2 text-sm text-gray-500">
          Loading...
        </span>
      )}
    </div>
  );
};

export default LocaleSwitcher; 