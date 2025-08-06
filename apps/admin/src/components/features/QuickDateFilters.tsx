import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Button } from '../common/Button';
import { QUICK_FILTER_OPTIONS, getQuickFilterDateRange, QuickFilterKey } from '../../utils/dateUtils';

interface QuickDateFiltersProps {
  activeFilter?: QuickFilterKey | null;
  onFilterSelect: (filterKey: QuickFilterKey) => void;
  onClearFilter: () => void;
  className?: string;
  compact?: boolean;
}

// Group filters by category for better organization
const FILTER_GROUPS = [
  {
    key: 'current',
    titleKey: 'filters.quick_filters.groups.current',
    filters: ['today', 'this_week', 'this_month'] as QuickFilterKey[],
  },
  {
    key: 'recent',
    titleKey: 'filters.quick_filters.groups.recent',
    filters: ['last_7_days', 'last_30_days', 'last_year'] as QuickFilterKey[],
  },
];

export const QuickDateFilters: React.FC<QuickDateFiltersProps> = ({
  activeFilter,
  onFilterSelect,
  onClearFilter,
  className = '',
  compact = false,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(!compact);

  const handleFilterClick = (filterKey: QuickFilterKey) => {
    if (activeFilter === filterKey) {
      onClearFilter();
    } else {
      onFilterSelect(filterKey);
    }
  };

  const getFilterOption = (key: QuickFilterKey) =>
    QUICK_FILTER_OPTIONS.find(opt => opt.key === key);

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Compact Header with Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {t('filters.quick_filters.title')}
            {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            {activeFilter && (
              <div className="w-2 h-2 rounded-full bg-primary-500 ml-1"></div>
            )}
          </button>
          {activeFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilter}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 px-2 py-1"
            >
              {t('common.clear')}
            </Button>
          )}
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="space-y-3 pl-2 border-l-2 border-neutral-200 dark:border-neutral-700">
            {FILTER_GROUPS.map((group) => (
              <div key={group.key} className="space-y-2">
                <h5 className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                  {t(group.titleKey)}
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {group.filters.map((filterKey) => {
                    const option = getFilterOption(filterKey);
                    if (!option) return null;

                    const isActive = activeFilter === filterKey;

                    return (
                      <Button
                        key={filterKey}
                        variant={isActive ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterClick(filterKey)}
                        className={`
                          text-xs font-medium transition-all duration-200 px-3 py-1.5 h-auto
                          ${isActive
                            ? 'shadow-sm ring-1 ring-primary-500/30 dark:ring-primary-400/30'
                            : 'hover:border-primary-300 dark:hover:border-primary-600'
                          }
                        `}
                      >
                        {t(option.translationKey)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default expanded layout
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {t('filters.quick_filters.title')}
        </h4>
        {activeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilter}
            className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {t('common.clear')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {FILTER_GROUPS.map((group) => (
          <div key={group.key} className="space-y-2">
            <h5 className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              {t(group.titleKey)}
            </h5>
            <div className="flex flex-wrap gap-2">
              {group.filters.map((filterKey) => {
                const option = getFilterOption(filterKey);
                if (!option) return null;

                const isActive = activeFilter === filterKey;

                return (
                  <Button
                    key={filterKey}
                    variant={isActive ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterClick(filterKey)}
                    className={`
                      text-xs font-medium transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'shadow-md ring-2 ring-primary-500/20 dark:ring-primary-400/20'
                        : 'hover:border-primary-300 dark:hover:border-primary-600'
                      }
                    `}
                  >
                    {t(option.translationKey)}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activeFilter && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <span>
            {t('filters.quick_filters.title')}: {t(getFilterOption(activeFilter)?.translationKey || '')}
          </span>
        </div>
      )}
    </div>
  );
};
