import React, { useEffect } from 'react';
import { SupportedLocale } from '@shared';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { getSupportedLocales } from '../i18n';
import { useTheme } from '../context/ThemeContext';

interface LocaleSwitcherProps {
  className?: string;
  selectClassName?: string;
}

const localeNames: Record<SupportedLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English'
};

const localeFlags: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  vi: '🇻🇳'
};

const LOCALE_STORAGE_KEY = 'quasar_locale';

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ 
  className = '',
  selectClassName = ''
}) => {
  const { getCurrentLocale, changeLanguage, isLoading } = useTranslationWithBackend();
  const { isDarkMode } = useTheme();
  const currentLocale = getCurrentLocale();
  const supportedLocales = getSupportedLocales().sort((a, b) => {
    // Sort English first
    if (a === 'en') return -1;
    if (b === 'en') return 1;
    return 0;
  });

  // Load locale from localStorage on component mount
  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale | null;
    if (savedLocale && supportedLocales.includes(savedLocale) && savedLocale !== currentLocale) {
      changeLanguage(savedLocale).catch(error => {
        console.error('Failed to load saved language:', error);
      });
    }
  }, []);

  const handleLocaleChange = async (locale: SupportedLocale) => {
    if (locale !== currentLocale && !isLoading) {
      try {
        await changeLanguage(locale);
        // Save to localStorage after successful change
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    }
  };

  const getSelectStyle = () => {
    return isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-primary-500 focus:border-primary-500'
      : 'bg-white border-gray-300 text-gray-800 focus:ring-primary-500 focus:border-primary-500';
  };

  return (
    <div className={`locale-switcher w-full ${className}`}>
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
        disabled={isLoading}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${getSelectStyle()} ${selectClassName}`}
        style={{
          textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        {supportedLocales.map((locale) => (
          <option 
            key={locale} 
            value={locale}
            style={{ 
              fontWeight: locale === 'en' ? 'bold' : 'normal',
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            }}
          >
            {localeFlags[locale]} {localeNames[locale]}
          </option>
        ))}
      </select>
      {isLoading && (
        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading...
        </span>
      )}
    </div>
  );
};

export default LocaleSwitcher; 