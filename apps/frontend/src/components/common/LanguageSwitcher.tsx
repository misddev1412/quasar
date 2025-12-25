'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguages } from '../../hooks/useLanguages';
import type { Language } from '../../types/trpc';

type Locale = 'en' | 'vi';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    languages: displayLanguages,
    isLoading,
    getLanguageName,
    getLanguageFlag
  } = useLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    // Set locale cookie for NextIntlProvider
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    // Set localStorage for i18next
    localStorage.setItem('i18nextLng', locale);

    // Reload the current page to apply the new locale
    window.location.reload();
    setIsOpen(false);
  };

  // Show loading state while fetching languages
  if (isLoading) {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <div className="flex items-center gap-3 bg-transparent border border-white/20 dark:border-white/20 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-50 dark:text-gray-200 min-w-[140px]">
          <span className="text-base">🌐</span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center bg-transparent border border-white/20 dark:border-white/20 rounded-lg px-2 py-2 text-sm font-medium text-white dark:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
        aria-label="Select Language"
      >
        <span className="text-base">{getLanguageFlag(currentLocale)}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 mt-1 -translate-x-1/2 bg-white dark:bg-gray-900/95 border border-white/20 dark:border-white/15 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[140px] backdrop-blur">
          {displayLanguages.map((language: Language, index: number) => (
            <button
              key={language.id}
              onClick={() => handleLocaleChange(language.code as Locale)}
              className={`
                flex items-center gap-3 w-full px-4 py-2 text-sm text-left transition-colors
                ${language.code === currentLocale
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === displayLanguages.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              <span className="text-base">{getLanguageFlag(language.code)}</span>
              <span>{getLanguageName(language.code)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
