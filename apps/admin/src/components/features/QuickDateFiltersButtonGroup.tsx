import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import { Button } from '../common/Button';
import { QUICK_FILTER_OPTIONS, QuickFilterKey } from '../../utils/dateUtils';

interface QuickDateFiltersButtonGroupProps {
  activeFilter?: QuickFilterKey | null;
  onFilterSelect: (filterKey: QuickFilterKey) => void;
  onClearFilter: () => void;
  className?: string;
}

export const QuickDateFiltersButtonGroup: React.FC<QuickDateFiltersButtonGroupProps> = ({
  activeFilter,
  onFilterSelect,
  onClearFilter,
  className = '',
}) => {
  const { t } = useTranslation();

  const handleFilterClick = (filterKey: QuickFilterKey) => {
    if (activeFilter === filterKey) {
      onClearFilter();
    } else {
      onFilterSelect(filterKey);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Title */}
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
        {t('filters.quick_filters.title')}:
      </span>

      {/* Button Groups Container */}
      <div className="flex items-center gap-4">
        {/* Current Period Group */}
        <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden shadow-sm">
          {['today', 'this_week', 'this_month'].map((filterKey, index) => {
            const option = QUICK_FILTER_OPTIONS.find(opt => opt.key === filterKey);
            if (!option) return null;

            const isActive = activeFilter === filterKey;

            return (
              <button
                key={filterKey}
                onClick={() => handleFilterClick(filterKey as QuickFilterKey)}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${index > 0 ? 'border-l border-neutral-300 dark:border-neutral-600' : ''}
                  ${isActive
                    ? 'bg-primary-500 text-white shadow-sm ring-1 ring-primary-500/20'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }
                `}
              >
                {t(option.translationKey)}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-600"></div>

        {/* Recent Period Group */}
        <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden shadow-sm">
          {['last_7_days', 'last_30_days', 'last_year'].map((filterKey, index) => {
            const option = QUICK_FILTER_OPTIONS.find(opt => opt.key === filterKey);
            if (!option) return null;

            const isActive = activeFilter === filterKey;

            return (
              <button
                key={filterKey}
                onClick={() => handleFilterClick(filterKey as QuickFilterKey)}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${index > 0 ? 'border-l border-neutral-300 dark:border-neutral-600' : ''}
                  ${isActive
                    ? 'bg-primary-500 text-white shadow-sm ring-1 ring-primary-500/20'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }
                `}
              >
                {t(option.translationKey)}
              </button>
            );
          })}
        </div>

        {/* Clear Button - Refined and Subtle */}
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

      {/* Active Filter Indicator (Mobile) */}
      {activeFilter && (
        <div className="sm:hidden flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <span>
            {t(QUICK_FILTER_OPTIONS.find(opt => opt.key === activeFilter)?.translationKey || '')}
          </span>
        </div>
      )}
    </div>
  );
};
