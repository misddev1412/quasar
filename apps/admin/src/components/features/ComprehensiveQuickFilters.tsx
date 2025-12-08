import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiCheck, FiX, FiFilter } from 'react-icons/fi';
import { Button } from '../common/Button';
import {
  QUICK_DATE_FILTER_CATEGORIES,
  FilterCategory
} from '../../utils/filterUtils';
import { QuickFilterKey, getQuickFilterDateRange } from '../../utils/dateUtils';

interface ComprehensiveQuickFiltersProps {
  activeFilter?: QuickFilterKey | null;
  onFilterSelect: (filterKey: QuickFilterKey) => void;
  onClearFilter: () => void;
  className?: string;
  // Configuration props
  categories?: FilterCategory[];
  showIcons?: boolean;
  maxWidth?: string;
  mode?: 'date-only';
  title?: string;
  subtitle?: string;
}

export const ComprehensiveQuickFilters: React.FC<ComprehensiveQuickFiltersProps> = ({
  activeFilter,
  onFilterSelect,
  onClearFilter,
  className = '',
  categories,
  showIcons = true,
  maxWidth = 'w-80',
  mode = 'date-only',
  title,
  subtitle,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine which categories to use
  const filterCategories = categories || QUICK_DATE_FILTER_CATEGORIES;

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

  const handleFilterClick = (filterKey: QuickFilterKey) => {
    if (activeFilter === filterKey) {
      onClearFilter();
    } else {
      onFilterSelect(filterKey);
    }
    setIsOpen(false);
  };

  // Get active filter details
  const getActiveFilterDetails = () => {
    if (!activeFilter) return null;
    
    for (const category of filterCategories) {
      const filter = category.filters.find(f => f.key === activeFilter);
      if (filter) {
        return { filter, category };
      }
    }
    return null;
  };

  const getActiveFilterLabel = () => {
    const details = getActiveFilterDetails();
    if (!details) {
      return title || t('filters.quick_filters.registration_date_title');
    }
    return t(details.filter.translationKey);
  };

  // Get total filter count for display
  const getTotalFilterCount = () => {
    return filterCategories.reduce((total, category) => total + category.filters.length, 0);
  };

  // Get main title based on mode
  const getMainTitle = () => {
    if (title) return title;
    return t('filters.quick_filters.registration_date_title');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeFilter ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 min-w-[180px] justify-between text-sm
            ${activeFilter ? 'ring-1 ring-primary-500/30 shadow-sm' : ''}
          `}
        >
          <div className="flex items-center gap-2 truncate">
            {showIcons && <FiFilter className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{getActiveFilterLabel()}</span>
            {activeFilter && (
              <div className="w-2 h-2 rounded-full bg-white/80 flex-shrink-0"></div>
            )}
          </div>
          <FiChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {activeFilter && (
          <button
            onClick={onClearFilter}
            className="
              flex items-center justify-center w-8 h-8 rounded-lg
              text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              transition-all duration-200
              border border-neutral-200 dark:border-neutral-600
              hover:border-neutral-300 dark:hover:border-neutral-500
            "
            aria-label={t('common.clear')}
            title={t('common.clear')}
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 ${maxWidth} bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50`}>
          <div className="p-2 max-h-96 overflow-y-auto">
            {/* Header with title and filter count */}
            <div className="px-3 py-3 mb-2 border-b border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {getMainTitle()}
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {getTotalFilterCount()} {t('common.options')}
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Dynamic Categories */}
            {filterCategories.map((category, categoryIndex) => (
              <div key={category.key} className="mb-2">
                {/* Category Header */}
                <div className="flex items-center gap-2 px-4 py-2 mb-2">
                  {showIcons && category.icon && (
                    <category.icon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  )}
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                    {t(category.titleKey)}
                  </span>
                </div>

                {/* Category Filters Container */}
                <div className="space-y-1 px-2">
                  {category.filters.map((filter) => {
                    const isActive = activeFilter === filter.key;
                    
                    return (
                      <button
                        key={filter.key}
                        onClick={() => handleFilterClick(filter.key as QuickFilterKey)}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200
                          border border-transparent
                          ${isActive 
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-700 shadow-sm' 
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-100 dark:hover:border-neutral-600'
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 dark:focus:border-primary-600
                        `}
                        aria-label={`${t('common.select')} ${t(filter.translationKey)}`}
                      >
                        <span className="truncate font-medium">{t(filter.translationKey)}</span>
                        {isActive && (
                          <FiCheck className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Separator between categories (except last) */}
                {categoryIndex < filterCategories.length - 1 && (
                  <div className="border-t border-neutral-100 dark:border-neutral-700 my-3 mx-2"></div>
                )}
              </div>
            ))}

            {/* Clear All Option */}
            {activeFilter && (
              <>
                <div className="border-t border-neutral-100 dark:border-neutral-700 my-3 mx-2"></div>
                <div className="px-2">
                  <button
                    onClick={onClearFilter}
                    className="
                      w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg transition-all duration-200
                      text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700
                      hover:text-neutral-800 dark:hover:text-neutral-200
                      border border-transparent hover:border-neutral-100 dark:hover:border-neutral-600
                      focus:outline-none focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-300 dark:focus:border-neutral-600
                    "
                  >
                    <FiX className="w-4 h-4" />
                    <span className="font-medium">{t('common.clear_all')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
