import React from 'react';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { Select, SelectOption } from '../common/Select';
import { DateInput } from '../common/DateInput';
import { Card } from '../common/Card';
import { FiX, FiFilter } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export interface CategoryFilterOptions {
  search?: string;
  isActive?: boolean;
  parentId?: string;
  level?: number;
  dateFrom?: string;
  dateTo?: string;
}

interface CategoryFilterProps {
  filters: CategoryFilterOptions;
  onFiltersChange: (filters: CategoryFilterOptions) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const LEVEL_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Levels' },
  { value: '0', label: 'Level 1' },
  { value: '1', label: 'Level 2' },
  { value: '2', label: 'Level 3' },
  { value: '3', label: 'Level 4' },
  { value: '4', label: 'Level 5' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslationWithBackend();

  const handleFilterChange = (key: keyof CategoryFilterOptions, value: string) => {
    const newFilters = { ...filters };
    
    if (key === 'isActive') {
      // Handle boolean conversion for isActive
      if (value === '') {
        delete newFilters.isActive;
      } else {
        newFilters.isActive = value === 'true';
      }
    } else if (key === 'level') {
      // Handle level filter
      if (value === '') {
        delete newFilters.level;
      } else {
        newFilters.level = parseInt(value);
      }
    } else {
      // Handle string filters
      if (value === '') {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
    }
    
    onFiltersChange(newFilters);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const today = formatDate(new Date());
  const oneYearAgo = formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

  return (
    <Card className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <FiFilter className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {t('categories.filterCategories', 'Filter Categories')}
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
            {t('common.clearAll', 'Clear All')}
          </Button>
        )}
      </div>

      {/* Filter Controls Grid - Enhanced alignment and consistent spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Status Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="status-filter"
            label={t('common.status', 'Status')}
            value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
            onChange={(value) => handleFilterChange('isActive', value)}
            options={STATUS_OPTIONS}
            placeholder={t('categories.selectStatus', 'Select status...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Level Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="level-filter"
            label={t('categories.level', 'Level')}
            value={filters.level !== undefined ? filters.level.toString() : ''}
            onChange={(value) => handleFilterChange('level', value)}
            options={LEVEL_OPTIONS}
            placeholder={t('categories.selectLevel', 'Select level...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Name/Search Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="name-filter"
            type="text"
            label={t('common.name', 'Name')}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder={t('categories.filterByName', 'Filter by name...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Parent ID Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="parent-filter"
            type="text"
            label={t('categories.parentCategory', 'Parent Category')}
            value={filters.parentId || ''}
            onChange={(e) => handleFilterChange('parentId', e.target.value)}
            placeholder={t('categories.filterByParentId', 'Filter by parent ID...')}
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Additional Filters Grid - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-4">
        {/* Date From Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="date-from"
            label={t('common.createdFrom', 'Created From')}
            value={filters.dateFrom || ''}
            onChange={(value) => handleFilterChange('dateFrom', value)}
            max={filters.dateTo || today}
            min={oneYearAgo}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Date To Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="date-to"
            label={t('common.createdTo', 'Created To')}
            value={filters.dateTo || ''}
            onChange={(value) => handleFilterChange('dateTo', value)}
            min={filters.dateFrom || oneYearAgo}
            max={today}
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
          <div className="flex flex-wrap gap-2">
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

            {filters.level !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-700 transition-colors">
                Level: {filters.level + 1}
                <button
                  onClick={() => handleFilterChange('level', '')}
                  className="ml-1 hover:text-violet-900 dark:hover:text-violet-100 transition-colors rounded-full p-0.5 hover:bg-violet-100 dark:hover:bg-violet-800/50"
                  aria-label="Remove level filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-colors">
                Name: {filters.search}
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  aria-label="Remove name filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.parentId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700 transition-colors">
                Parent: {filters.parentId}
                <button
                  onClick={() => handleFilterChange('parentId', '')}
                  className="ml-1 hover:text-amber-900 dark:hover:text-amber-100 transition-colors rounded-full p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800/50"
                  aria-label="Remove parent filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 transition-colors">
                Created: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('dateFrom', '');
                    handleFilterChange('dateTo', '');
                  }}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
                  aria-label="Remove created date filter"
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