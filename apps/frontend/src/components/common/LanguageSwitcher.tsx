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
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">
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
        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
        aria-label="Select Language"
      >
        <span className="text-base">{getLanguageFlag(currentLocale)}</span>
        <span>{getLanguageName(currentLocale)}</span>
      </button>

      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
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