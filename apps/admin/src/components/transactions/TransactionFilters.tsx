import React from 'react';
import { FiX } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { TransactionFilterState } from '../../types/transactions';

interface CurrencyOption {
  code: string;
  label: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilterState;
  onFiltersChange: (filters: TransactionFilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  currencyOptions: CurrencyOption[];
  isCurrencyLoading?: boolean;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  currencyOptions,
  isCurrencyLoading = false,
}) => {
  const { t } = useTranslationWithBackend();

  const handleFilterChange = (
    key: keyof TransactionFilterState,
    value: string | number | undefined,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const statusOptions: Array<{ value: TransactionFilterState['status']; label: string }> = [
    { value: 'pending', label: t('transactions.status.pending', 'Pending') },
    { value: 'processing', label: t('transactions.status.processing', 'Processing') },
    { value: 'completed', label: t('transactions.status.completed', 'Completed') },
    { value: 'failed', label: t('transactions.status.failed', 'Failed') },
    { value: 'cancelled', label: t('transactions.status.cancelled', 'Cancelled') },
  ];

  const typeOptions: Array<{ value: TransactionFilterState['type']; label: string }> = [
    { value: 'order_payment', label: t('transactions.types.order_payment', 'Order Payment') },
    { value: 'refund', label: t('transactions.types.refund', 'Refund') },
    { value: 'wallet_topup', label: t('transactions.types.wallet_topup', 'Wallet Top-up') },
    { value: 'withdrawal', label: t('transactions.types.withdrawal', 'Withdrawal') },
    { value: 'adjustment', label: t('transactions.types.adjustment', 'Adjustment') },
    { value: 'subscription', label: t('transactions.types.subscription', 'Subscription') },
  ];

  const directionOptions: Array<{ value: TransactionFilterState['direction']; label: string }> = [
    { value: 'credit', label: t('transactions.directions.credit', 'Credit') },
    { value: 'debit', label: t('transactions.directions.debit', 'Debit') },
  ];

  return (
    <Card className="p-6 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('transactions.filters.title', 'Filters')}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.status', 'Status')}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t('transactions.filters.all_statuses', 'All statuses')}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.type', 'Type')}
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t('transactions.filters.all_types', 'All types')}</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.direction', 'Direction')}
          </label>
          <select
            value={filters.direction || ''}
            onChange={(e) => handleFilterChange('direction', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t('transactions.filters.all_directions', 'All directions')}</option>
            {directionOptions.map((option) => (
              <option key={option.value} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.currency', 'Currency')}
          </label>
          <select
            value={filters.currency || ''}
            onChange={(e) => handleFilterChange('currency', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={currencyOptions.length === 0 || isCurrencyLoading}
          >
            <option value="">
              {isCurrencyLoading
                ? t('transactions.filters.loading_currencies', 'Loading currencies...')
                : t('transactions.filters.all_currencies', 'All currencies')}
            </option>
            {currencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.customer_id', 'Customer ID')}
          </label>
          <input
            type="text"
            value={filters.customerId || ''}
            onChange={(e) => handleFilterChange('customerId', e.target.value || undefined)}
            placeholder={t('transactions.filters.customer_id_placeholder', 'Search by customer id')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.min_amount', 'Min Amount')}
          </label>
          <input
            type="number"
            value={filters.minAmount ?? ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.max_amount', 'Max Amount')}
          </label>
          <input
            type="number"
            value={filters.maxAmount ?? ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.date_from', 'Date From')}
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('transactions.filters.date_to', 'Date To')}
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </Card>
  );
};
