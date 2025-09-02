import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { Card } from '../common/Card';
import { FormInput } from '../common/FormInput';
import { Select, SelectOption } from '../common/Select';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { LanguageFiltersType } from '../../types/language';

interface LanguageFiltersProps {
  filters: LanguageFiltersType;
  onFiltersChange: (filters: LanguageFiltersType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export const LanguageFilters: React.FC<LanguageFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslationWithBackend();

  const handleFilterChange = (key: keyof LanguageFiltersType, value: string) => {
    const newFilters = { ...filters };
    
    if (key === 'isActive') {
      if (value === '') {
        delete newFilters.isActive;
      } else {
        newFilters.isActive = value === 'true';
      }
    } else {
      if (value === '') {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <Card className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <FiFilter className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {t('languages.filterTitle')}
            </h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </p>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            startIcon={<FiX />}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {t('common.clearAll')}
          </Button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Search Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="search-filter"
            type="text"
            label={t('languages.search')}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder={t('languages.searchPlaceholder')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="status-filter"
            label={t('languages.status')}
            value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
            onChange={(value) => handleFilterChange('isActive', value)}
            options={STATUS_OPTIONS}
            placeholder="Select status..."
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-colors">
                Search: {filters.search}
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  aria-label="Remove search filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isActive !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 transition-colors">
                Status: {filters.isActive ? 'Active' : 'Inactive'}
                <button
                  onClick={() => handleFilterChange('isActive', '')}
                  className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                  aria-label="Remove status filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};