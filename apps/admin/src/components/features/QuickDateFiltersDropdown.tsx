import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiCheck, FiX, FiCalendar } from 'react-icons/fi';
import { Button } from '../common/Button';
import { QUICK_FILTER_OPTIONS, QuickFilterKey } from '../../utils/dateUtils';

// Define filter categories for better organization and extensibility
export interface FilterCategory {
  key: string;
  titleKey: string;
  icon?: React.ComponentType<{ className?: string }>;
  filters: FilterOption[];
}

export interface FilterOption {
  key: string;
  translationKey: string;
  type: 'date' | 'status' | 'role' | 'custom';
  category: string;
}

// Current date filter categories - easily extensible
const DATE_FILTER_CATEGORIES: FilterCategory[] = [
  {
    key: 'current_period',
    titleKey: 'filters.quick_filters.groups.current',
    icon: FiCalendar,
    filters: [
      { key: 'today', translationKey: 'filters.quick_filters.today', type: 'date', category: 'current_period' },
      { key: 'this_week', translationKey: 'filters.quick_filters.this_week', type: 'date', category: 'current_period' },
      { key: 'this_month', translationKey: 'filters.quick_filters.this_month', type: 'date', category: 'current_period' },
    ],
  },
  {
    key: 'recent_period',
    titleKey: 'filters.quick_filters.groups.recent',
    icon: FiCalendar,
    filters: [
      { key: 'last_7_days', translationKey: 'filters.quick_filters.last_7_days', type: 'date', category: 'recent_period' },
      { key: 'last_30_days', translationKey: 'filters.quick_filters.last_30_days', type: 'date', category: 'recent_period' },
      { key: 'last_year', translationKey: 'filters.quick_filters.last_year', type: 'date', category: 'recent_period' },
    ],
  },
];

interface QuickDateFiltersDropdownProps {
  activeFilter?: QuickFilterKey | null;
  onFilterSelect: (filterKey: QuickFilterKey) => void;
  onClearFilter: () => void;
  className?: string;
  // Future extensibility props
  categories?: FilterCategory[];
  showIcons?: boolean;
  maxWidth?: string;
}

export const QuickDateFiltersDropdown: React.FC<QuickDateFiltersDropdownProps> = ({
  activeFilter,
  onFilterSelect,
  onClearFilter,
  className = '',
  categories = DATE_FILTER_CATEGORIES,
  showIcons = true,
  maxWidth = 'w-72',
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Get active filter details from categories
  const getActiveFilterDetails = () => {
    if (!activeFilter) return null;

    for (const category of categories) {
      const filter = category.filters.find(f => f.key === activeFilter);
      if (filter) {
        return { filter, category };
      }
    }
    return null;
  };

  const getActiveFilterLabel = () => {
    const details = getActiveFilterDetails();
    if (!details) return t('filters.quick_filters.title');
    return t(details.filter.translationKey);
  };

  // Get total filter count for display
  const getTotalFilterCount = () => {
    return categories.reduce((total, category) => total + category.filters.length, 0);
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
            flex items-center gap-2 min-w-[160px] justify-between text-sm
            ${activeFilter ? 'ring-1 ring-primary-500/30 shadow-sm' : ''}
          `}
        >
          <div className="flex items-center gap-2 truncate">
            {showIcons && <FiCalendar className="w-4 h-4 flex-shrink-0" />}
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
          <div className="p-2 max-h-80 overflow-y-auto">
            {/* Header with filter count */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-neutral-100 dark:border-neutral-700">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                {t('filters.quick_filters.title')}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {getTotalFilterCount()} {t('common.options', { defaultValue: 'options' })}
              </span>
            </div>

            {/* Dynamic Categories */}
            {categories.map((category, categoryIndex) => (
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

                {/* Category Filters */}
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
                {categoryIndex < categories.length - 1 && (
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
                    <span className="font-medium">{t('common.clear_all', { defaultValue: 'Clear All' })}</span>
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
