import React, { useEffect, useMemo } from 'react';
import { SupportedLocale } from '@shared';
import { useTranslation } from 'react-i18next';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { getSupportedLocales } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { useActiveLanguages } from '../hooks/useLanguages';

interface LocaleSwitcherProps {
  className?: string;
  selectClassName?: string;
}

// Fallback for hardcoded locales (backwards compatibility)
const localeNames: Record<SupportedLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English'
};

const localeFlags: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  vi: '🇻🇳'
};

const LOCALE_STORAGE_KEY = 'admin-locale';

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ 
  className = '',
  selectClassName = ''
}) => {
  const { i18n } = useTranslation();
  const { changeLanguage, isLoading } = useTranslationWithBackend();
  const { isDarkMode } = useTheme();
  const { activeLanguages, isLoading: languagesLoading } = useActiveLanguages();
  const currentLocale = i18n.resolvedLanguage as SupportedLocale;

  // Combine database languages with fallback support
  const availableLanguages = useMemo(() => {
    if (activeLanguages.length > 0) {
      // Use database languages
      return activeLanguages
        .filter(lang => getSupportedLocales().includes(lang.code as SupportedLocale))
        .sort((a, b) => {
          // Sort by sortOrder first, then by default
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
    } else {
      // Fallback to hardcoded locales
      return getSupportedLocales().sort((a, b) => {
        if (a === 'en') return -1;
        if (b === 'en') return 1;
        return 0;
      }).map(code => ({
        id: code,
        code,
        name: localeNames[code],
        nativeName: localeNames[code],
        icon: localeFlags[code],
        isActive: true,
        isDefault: code === 'en',
        sortOrder: code === 'en' ? 0 : 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
  }, [activeLanguages]);

  // Note: Language detection from localStorage is handled by i18n LanguageDetector
  // No need to manually load from localStorage as i18n will do this automatically

  const handleLocaleChange = async (locale: SupportedLocale) => {
    if (locale !== currentLocale && !isLoading) {
      try {
        console.log('🔄 Changing language from', currentLocale, 'to', locale);
        console.log('🔄 localStorage BEFORE change:', localStorage.getItem(LOCALE_STORAGE_KEY));
        
        // Change language directly via i18n to ensure LanguageDetector caching works
        await i18n.changeLanguage(locale);
        console.log('✅ Language changed successfully via i18n to:', i18n.language);
        
        // Verify it was saved to localStorage
        setTimeout(() => {
          console.log('💾 localStorage AFTER change:', localStorage.getItem(LOCALE_STORAGE_KEY));
        }, 100);
        
      } catch (error) {
        console.error('❌ Failed to change language:', error);
      }
    }
  };

  const getSelectStyle = () => {
    return isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-primary-500 focus:border-primary-500'
      : 'bg-white border-gray-300 text-gray-800 focus:ring-primary-500 focus:border-primary-500';
  };

  const isComponentLoading = isLoading || languagesLoading;

  return (
    <div className={`locale-switcher w-full ${className}`}>
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
        disabled={isComponentLoading}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${getSelectStyle()} ${selectClassName}`}
        style={{
          textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        {availableLanguages.map((language) => (
          <option 
            key={language.code} 
            value={language.code}
            style={{ 
              fontWeight: language.isDefault ? 'bold' : 'normal',
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            }}
          >
            {language.icon || '🌐'} {language.name}
          </option>
        ))}
      </select>
      {isComponentLoading && (
        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading...
        </span>
      )}
    </div>
  );
};

export default LocaleSwitcher; 