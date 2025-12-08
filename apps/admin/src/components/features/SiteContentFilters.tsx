'use client';

import React, { useMemo } from 'react';
import clsx from 'clsx';
import { FiFilter, FiX } from 'react-icons/fi';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Select, SelectOption } from '../common/Select';

export type SiteContentFilterKey = 'category' | 'status' | 'languageCode';
export type SiteContentFiltersState = Record<SiteContentFilterKey, string>;

interface SiteContentFiltersProps {
  filters: SiteContentFiltersState;
  onFilterChange: (filterType: SiteContentFilterKey, value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

const LANGUAGE_CODES = ['en', 'vi', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru'];

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const buildCategoryOptions = (): SelectOption[] => [
  { value: '', label: 'All Categories' },
  ...Object.values(SiteContentCategory).map((category) => ({
    value: category,
    label: formatEnumLabel(category),
  })),
];

const buildStatusOptions = (): SelectOption[] => [
  { value: '', label: 'All Statuses' },
  ...Object.values(SiteContentStatus).map((status) => ({
    value: status,
    label: formatEnumLabel(status),
  })),
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Languages' },
  ...LANGUAGE_CODES.map((code) => ({
    value: code,
    label: code.toUpperCase(),
  })),
];

const SiteContentFilters: React.FC<SiteContentFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  className,
}) => {
  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).reduce((count, [, value]) => {
        if (typeof value !== 'string') return count;
        return value.trim() ? count + 1 : count;
      }, 0),
    [filters],
  );

  const categoryOptions = useMemo(buildCategoryOptions, []);
  const statusOptions = useMemo(buildStatusOptions, []);

  return (
    <Card
      className={clsx(
        'p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <FiFilter className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Filter Site Content
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
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          id="site-content-category"
          label="Category"
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
          options={categoryOptions}
          size="md"
        />

        <Select
          id="site-content-status"
          label="Status"
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions}
          size="md"
        />

        <Select
          id="site-content-language"
          label="Language"
          value={filters.languageCode}
          onChange={(value) => onFilterChange('languageCode', value)}
          options={LANGUAGE_OPTIONS}
          size="md"
        />
      </div>
    </Card>
  );
};

export default SiteContentFilters;
