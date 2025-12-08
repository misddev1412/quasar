import React from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export interface AttributeFilterOptions {
  search?: string;
  type?: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'COLOR' | 'DATE';
  isRequired?: boolean;
  isFilterable?: boolean;
}

interface AttributeFilterProps {
  filters: AttributeFilterOptions;
  onFiltersChange: (filters: AttributeFilterOptions) => void;
  onClose: () => void;
}

export const AttributeFilter: React.FC<AttributeFilterProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const { t } = useTranslationWithBackend();

  const handleFilterChange = (key: keyof AttributeFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const attributeTypes = [
    { value: '', label: t('common.all', 'All') },
    { value: 'TEXT', label: t('attributes.types.text', 'Text') },
    { value: 'NUMBER', label: t('attributes.types.number', 'Number') },
    { value: 'BOOLEAN', label: t('attributes.types.boolean', 'Boolean') },
    { value: 'SELECT', label: t('attributes.types.select', 'Select') },
    { value: 'MULTISELECT', label: t('attributes.types.multiselect', 'Multi-select') },
    { value: 'COLOR', label: t('attributes.types.color', 'Color') },
    { value: 'DATE', label: t('attributes.types.date', 'Date') },
  ];

  const booleanOptions = [
    { value: '', label: t('common.all', 'All') },
    { value: 'true', label: t('common.yes', 'Yes') },
    { value: 'false', label: t('common.no', 'No') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {t('common.filters', 'Filters')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <FiX className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('common.search', 'Search')}
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={t('attributes.search.placeholder', 'Search attributes...')}
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('attributes.type', 'Type')}
          </label>
          <Select
            value={filters.type || ''}
            onChange={(value) => handleFilterChange('type', value)}
            options={attributeTypes}
          />
        </div>

        {/* Is Required */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('attributes.isRequired', 'Required')}
          </label>
          <Select
            value={filters.isRequired !== undefined ? filters.isRequired.toString() : ''}
            onChange={(value) => handleFilterChange('isRequired', value === '' ? undefined : value === 'true')}
            options={booleanOptions}
          />
        </div>

        {/* Is Filterable */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('attributes.isFilterable', 'Filterable')}
          </label>
          <Select
            value={filters.isFilterable !== undefined ? filters.isFilterable.toString() : ''}
            onChange={(value) => handleFilterChange('isFilterable', value === '' ? undefined : value === 'true')}
            options={booleanOptions}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
        >
          {t('common.clearFilters', 'Clear Filters')}
        </Button>
      </div>
    </div>
  );
};