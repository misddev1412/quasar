import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Select, type SelectOption } from '../common/Select';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import type { WarehouseFiltersType } from '../../types/warehouse';

interface WarehouseFiltersProps {
  filters: WarehouseFiltersType;
  onFiltersChange: (filters: WarehouseFiltersType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const WarehouseFilters: React.FC<WarehouseFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslationWithBackend();

  const statusOptions: SelectOption[] = [
    { value: '', label: t('common.all', 'All') },
    { value: 'true', label: t('common.active', 'Active') },
    { value: 'false', label: t('common.inactive', 'Inactive') },
  ];

  const defaultOptions: SelectOption[] = [
    { value: '', label: t('common.all', 'All') },
    { value: 'true', label: t('warehouses.default_only', 'Default only') },
    { value: 'false', label: t('warehouses.non_default_only', 'Non-default only') },
  ];

  const handleFilterChange = (key: keyof WarehouseFiltersType, value: string) => {
    const nextFilters: WarehouseFiltersType = { ...filters };

    if (value === '') {
      delete nextFilters[key];
    } else {
      nextFilters[key] = value === 'true';
    }

    onFiltersChange(nextFilters);
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
              {t('warehouses.filterTitle', 'Filter Warehouses')}
            </h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {activeFilterCount}{' '}
                {t('common.filters', 'Filters')}
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
            {t('common.clear_all', 'Clear All')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="warehouse-status-filter"
            label={t('warehouses.filterStatus', 'Status')}
            value={filters.isActive !== undefined ? String(filters.isActive) : ''}
            onChange={(value) => handleFilterChange('isActive', value)}
            options={statusOptions}
            placeholder={t('common.status', 'Status')}
            size="md"
          />
        </div>

        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="warehouse-default-filter"
            label={t('warehouses.filterDefault', 'Default Warehouse')}
            value={filters.isDefault !== undefined ? String(filters.isDefault) : ''}
            onChange={(value) => handleFilterChange('isDefault', value)}
            options={defaultOptions}
            placeholder={t('warehouses.filterDefault', 'Default Warehouse')}
            size="md"
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-wrap gap-2">
            {filters.isActive !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-colors">
                {t('warehouses.filterStatus', 'Status')}: {filters.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                <button
                  type="button"
                  onClick={() => handleFilterChange('isActive', '')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  aria-label={t('common.clear', 'Clear')}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isDefault !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700 transition-colors">
                {t('warehouses.filterDefault', 'Default Warehouse')}: {filters.isDefault ? t('warehouses.is_default', 'Default Warehouse') : t('warehouses.non_default_only', 'Non-default only')}
                <button
                  type="button"
                  onClick={() => handleFilterChange('isDefault', '')}
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100 transition-colors rounded-full p-0.5 hover:bg-purple-100 dark:hover:bg-purple-800/50"
                  aria-label={t('common.clear', 'Clear')}
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
