import React from 'react';
import { FiX } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export interface CustomerFiltersType {
  status?: string;
  type?: string;
  isVip?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  maxOrders?: number;
}

interface CustomerFiltersProps {
  filters: CustomerFiltersType;
  onFiltersChange: (filters: CustomerFiltersType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslationWithBackend();

  const handleFilterChange = (key: keyof CustomerFiltersType, value: string | number | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearSpecificFilter = (key: keyof CustomerFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('common.filters', 'Filters')}
            </h3>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {activeFilterCount} {t('common.active', 'active')}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
          >
            <FiX className="w-4 h-4 mr-1" />
            {t('common.clear_all', 'Clear All')}
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.status')}
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">{t('admin.all_statuses')}</option>
              <option value="ACTIVE">{t('admin.customer_status.active')}</option>
              <option value="INACTIVE">{t('admin.customer_status.inactive')}</option>
              <option value="BLOCKED">{t('admin.customer_status.blocked')}</option>
              <option value="PENDING">{t('admin.customer_status.pending')}</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.customer_type')}
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">{t('admin.all_types')}</option>
              <option value="INDIVIDUAL">{t('admin.customer_type.individual')}</option>
              <option value="BUSINESS">{t('admin.customer_type.business')}</option>
            </select>
          </div>

          {/* Min Spent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('customers.min_spent', 'Min Spent')}
            </label>
            <input
              type="number"
              value={filters.minSpent || ''}
              onChange={(e) => handleFilterChange('minSpent', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Max Spent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('customers.max_spent', 'Max Spent')}
            </label>
            <input
              type="number"
              value={filters.maxSpent || ''}
              onChange={(e) => handleFilterChange('maxSpent', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Min Orders Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('customers.min_orders', 'Min Orders')}
            </label>
            <input
              type="number"
              value={filters.minOrders || ''}
              onChange={(e) => handleFilterChange('minOrders', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Max Orders Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('customers.max_orders', 'Max Orders')}
            </label>
            <input
              type="number"
              value={filters.maxOrders || ''}
              onChange={(e) => handleFilterChange('maxOrders', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('customers.date_from', 'Date From')}
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('customers.date_to', 'Date To')}
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* VIP Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="vip-filter"
            checked={filters.isVip || false}
            onChange={(e) => handleFilterChange('isVip', e.target.checked || undefined)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="vip-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('customers.vip_only', 'VIP Customers Only')}
          </label>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value && value !== false) return null;

                let label = '';
                let displayValue = '';

                switch (key) {
                  case 'status':
                    label = t('admin.status');
                    displayValue = t(`admin.customer_status.${value.toLowerCase()}`);
                    break;
                  case 'type':
                    label = t('admin.customer_type');
                    displayValue = t(`admin.customer_type.${value.toLowerCase()}`);
                    break;
                  case 'isVip':
                    if (!value) return null;
                    label = t('customers.vip_only', 'VIP Only');
                    displayValue = '';
                    break;
                  case 'minSpent':
                    label = t('customers.min_spent', 'Min Spent');
                    displayValue = `$${value}`;
                    break;
                  case 'maxSpent':
                    label = t('customers.max_spent', 'Max Spent');
                    displayValue = `$${value}`;
                    break;
                  case 'minOrders':
                    label = t('customers.min_orders', 'Min Orders');
                    displayValue = `${value}`;
                    break;
                  case 'maxOrders':
                    label = t('customers.max_orders', 'Max Orders');
                    displayValue = `${value}`;
                    break;
                  case 'dateFrom':
                    label = t('customers.date_from', 'From');
                    displayValue = value;
                    break;
                  case 'dateTo':
                    label = t('customers.date_to', 'To');
                    displayValue = value;
                    break;
                  default:
                    return null;
                }

                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {label}{displayValue && `: ${displayValue}`}
                    <button
                      type="button"
                      onClick={() => handleClearSpecificFilter(key as keyof CustomerFiltersType)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};