import React, { useMemo } from 'react';
import { FiFilter } from 'react-icons/fi';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import type { ShippingProviderFiltersType } from '../../types/shipping-provider';

type ToggleableFilterKey = 'isActive' | 'hasTracking' | 'supportsDomestic' | 'supportsInternational' | 'supportsExpress';

interface ShippingProviderFiltersProps {
  filters: ShippingProviderFiltersType;
  onFiltersChange: (filters: ShippingProviderFiltersType) => void;
  onClearFilters?: () => void;
  activeFilterCount?: number;
}

export const ShippingProviderFilters: React.FC<ShippingProviderFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount = 0,
}) => {
  const { t } = useTranslationWithBackend();

  const options = useMemo<Array<{ key: ToggleableFilterKey; label: string }>>(
    () => [
      {
        key: 'isActive',
        label: t('shippingProviders.filters.activeOnly', 'Active providers'),
      },
      {
        key: 'hasTracking',
        label: t('shippingProviders.filters.hasTracking', 'Supports tracking'),
      },
      {
        key: 'supportsDomestic',
        label: t('shippingProviders.filters.domestic', 'Domestic service'),
      },
      {
        key: 'supportsInternational',
        label: t('shippingProviders.filters.international', 'International service'),
      },
      {
        key: 'supportsExpress',
        label: t('shippingProviders.filters.express', 'Express service'),
      },
    ],
    [t]
  );

  const handleToggle = (key: ToggleableFilterKey) => {
    const isCurrentlyActive = filters[key] === true;
    const nextFilters: ShippingProviderFiltersType = {
      ...filters,
      page: 1,
    };

    nextFilters[key] = isCurrentlyActive ? undefined : true;

    onFiltersChange(nextFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
        <FiFilter className="mr-1 h-4 w-4" />
        {t('shippingProviders.filters.title', 'Filters')}
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-100 px-2 text-xs font-semibold text-primary-600">
            {activeFilterCount}
          </span>
        )}
      </span>
      {options.map(({ key, label }) => (
        <Button
          key={key}
          variant={filters[key] === true ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleToggle(key)}
        >
          {label}
        </Button>
      ))}
      {onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          {t('common.clear_filters', 'Clear filters')}
        </Button>
      )}
    </div>
  );
};

export default ShippingProviderFilters;
