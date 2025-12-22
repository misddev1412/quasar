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
        await i18n.changeLanguage(locale);
      } catch (error) {
        console.error('❌ Failed to change language:', error);
      }
    }
  };

  const getDefaultSelectStyle = () => {
    return isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-primary-500 focus:border-primary-500'
      : 'bg-white border-gray-300 text-gray-800 focus:ring-primary-500 focus:border-primary-500';
  };

  const isComponentLoading = isLoading || languagesLoading;

  if (selectClassName) {
    // When used in auth forms, create a styled wrapper that looks exactly like the button
    const currentLanguage = availableLanguages.find(lang => lang.code === currentLocale);
    
    return (
      <div className={`locale-switcher relative ${className}`}>
        {/* Styled wrapper that looks exactly like the button */}
        <div className={selectClassName} style={{ minHeight: '40px', position: 'relative' }}>
          <span className="flex items-center justify-center h-full px-3">
            <span className="mr-2 text-base">{currentLanguage?.icon || '🌐'}</span>
            <span className="hidden sm:inline text-sm font-medium">{currentLanguage?.name || 'EN'}</span>
            <span className="sm:hidden text-sm font-medium">{currentLanguage?.code?.toUpperCase() || 'EN'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-70" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l4 4 4-4" />
            </svg>
          </span>
        </div>
        
        {/* Hidden select element positioned over the wrapper */}
        <select
          value={currentLocale}
          onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
          disabled={isComponentLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            zIndex: 10
          }}
        >
          {availableLanguages.map((language) => (
            <option 
              key={language.code} 
              value={language.code}
              style={{ 
                fontWeight: language.isDefault ? 'bold' : 'normal',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#1f2937'
              }}
            >
              {language.icon || '🌐'} {language.name}
            </option>
          ))}
        </select>
        
        {isComponentLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent opacity-60"></div>
          </div>
        )}
      </div>
    );
  }

  // Default styling for header and general usage
  const isHeaderUsage = className.includes('header-locale-switcher');
  const currentLanguage = availableLanguages.find(lang => lang.code === currentLocale);
  
  return (
    <div className={`locale-switcher w-full relative ${className}`}>
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
        disabled={isComponentLoading}
        className={`w-full border rounded-md text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all duration-200 ${
          isHeaderUsage 
            ? 'px-3 py-2 h-[36px] appearance-none cursor-pointer' 
            : 'px-3 py-2'
        } ${getDefaultSelectStyle()}`}
        style={{
          textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
          backgroundImage: isHeaderUsage 
            ? `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>')}")` 
            : 'none',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '16px',
          paddingRight: isHeaderUsage ? '32px' : '12px'
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
            {isHeaderUsage ? (
              `${language.icon || '🌐'} ${language.name}`
            ) : (
              `${language.icon || '🌐'} ${language.name}`
            )}
          </option>
        ))}
      </select>
      
      {isComponentLoading && (
        <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isHeaderUsage ? 'right-8' : 'right-2'}`}>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent opacity-60"></div>
        </div>
      )}
    </div>
  );
};

export default LocaleSwitcher; 
